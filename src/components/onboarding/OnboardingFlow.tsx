"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ProgramGenerator } from "@/lib/program-generator";
import { OnboardingStep } from "./OnboardingStep";
import { OnboardingProgress } from "./OnboardingProgress";
import {
  ONBOARDING_STEPS,
  getNextStep,
  getPreviousStep,
  calculateProgress,
} from "@/lib/onboarding-steps";
import {
  type AssessmentData,
  type ExperienceLevel,
} from "@/lib/experience-assessment";
import type { OnboardingData } from "@/types/onboarding";
import AssessmentResult from "./AssessmentResult";
import type { ProgramGenerationParams } from "@/types/program";

export function OnboardingFlow() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStepId, setCurrentStepId] = useState(ONBOARDING_STEPS[0].id);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null
  );

  // Check if user already has completed profile
  useEffect(() => {
    async function checkExistingProfile() {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("experience_level, full_name")
        .eq("id", user.id)
        .maybeSingle();

      // If user already has experience level set, they've completed onboarding
      if (profile?.experience_level && profile?.full_name) {
        router.push("/dashboard");
      }
    }

    checkExistingProfile();
  }, [user, router]);

  const currentStep = ONBOARDING_STEPS.find(
    (step) => step.id === currentStepId
  )!;
  const progress = calculateProgress(currentStepId);

  // Handle form data updates
  function updateFormData(data: Partial<OnboardingData>) {
    setFormData((prev) => ({ ...prev, ...data }));
  }

  // Handle next step
  function handleNext(dataFromLastStep?: Partial<OnboardingData>) {
    const nextStep = getNextStep(currentStepId);
    if (nextStep) {
      setCurrentStepId(nextStep.id);
    } else {
      // Before completing, show assessment results - pas besoin de délai ici car déjà géré côté bouton
      const merged = dataFromLastStep ? { ...formData, ...dataFromLastStep } : formData;
      showAssessmentResults(merged);
    }
  }

  // Show assessment results before final completion
  function showAssessmentResults(dataToValidate = formData) {
    // Vérifier tous les champs requis (exclure injuries_or_limitations qui est optionnel)
    const requiredFields = {
      full_name: !!dataToValidate.full_name,
      can_do_pushups: dataToValidate.can_do_pushups !== undefined,
      can_do_pullups: dataToValidate.can_do_pullups !== undefined,
      can_hold_plank: dataToValidate.can_hold_plank !== undefined,
      previous_training: !!(
        dataToValidate.previous_training &&
        dataToValidate.previous_training.length > 0
      ),
      primary_goal: !!dataToValidate.primary_goal,
      training_frequency: !!dataToValidate.training_frequency,
      available_equipment: !!(
        dataToValidate.available_equipment &&
        dataToValidate.available_equipment.length > 0
      ),
      typical_workout_time: !!dataToValidate.typical_workout_time,
    };

    const allFieldsValid = Object.values(requiredFields).every(Boolean);

    if (allFieldsValid) {
      const assessment: AssessmentData = {
        can_do_pushups: dataToValidate.can_do_pushups!,
        can_do_pullups: dataToValidate.can_do_pullups!,
        can_hold_plank: dataToValidate.can_hold_plank!,
        previous_training: dataToValidate.previous_training!,
        primary_goal: dataToValidate.primary_goal!,
        training_frequency: String(dataToValidate.training_frequency!),
      };

      // Mettre à jour formData avec les données validées si nécessaire
      if (dataToValidate !== formData) {
        setFormData(dataToValidate);
      }

      setAssessmentData(assessment);
      setShowAssessmentResult(true);
    } else {
      const missingFields = Object.entries(requiredFields)
        .filter(([, isValid]) => !isValid)
        .map(([field]) => field);

      setError(
        `Veuillez compléter tous les champs requis. Champs manquants: ${missingFields.join(
          ", "
        )}`
      );
    }
  }

  // Handle previous step
  function handlePrevious() {
    const prevStep = getPreviousStep(currentStepId);
    if (prevStep) {
      setCurrentStepId(prevStep.id);
    }
  }

  // Handle onboarding completion with experience level
  async function handleComplete(experienceLevel: ExperienceLevel) {
    if (!user || !formData || !assessmentData) return;

    setLoading(true);
    setError(null);

    try {
      // Create or update user profile (upsert) with all onboarding data
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          experience_level: experienceLevel,
          // Fitness Assessment
          can_do_pushups: formData.can_do_pushups,
          can_do_pullups: formData.can_do_pullups,
          can_hold_plank: formData.can_hold_plank,
          // Goals & Preferences
          primary_goal: formData.primary_goal,
          training_frequency: formData.training_frequency,
          available_equipment: formData.available_equipment,
          // Schedule
          preferred_workout_days: formData.preferred_workout_days,
          typical_workout_time: formData.typical_workout_time,
          // Experience Details
          previous_training: formData.previous_training,
          injuries_or_limitations: formData.injuries_or_limitations || null,
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) throw profileError;

      // Generate initial program based on user data
      if (
        formData.can_do_pushups !== undefined &&
        formData.can_do_pullups !== undefined &&
        formData.can_hold_plank !== undefined &&
        formData.primary_goal &&
        formData.training_frequency &&
        formData.available_equipment &&
        formData.previous_training
      ) {
        const programParams: ProgramGenerationParams = {
          experience_level: experienceLevel,
          primary_goal: formData.primary_goal,
          training_frequency: formData.training_frequency,
          available_equipment: formData.available_equipment,
          // previous_training: formData.previous_training,
          can_do_pushups: formData.can_do_pushups,
          can_do_pullups: formData.can_do_pullups,
          can_hold_plank: formData.can_hold_plank,
        };

        const generator = new ProgramGenerator(programParams);
        await generator.generateProgram(user.id);
      }

      // Store additional onboarding data for reference
      localStorage.setItem(
        "onboarding_data",
        JSON.stringify({
          ...formData,
          experience_level: experienceLevel,
          completed_at: new Date().toISOString(),
        })
      );

      // Redirect to dashboard
      router.push("/dashboard?welcome=true");
    } catch (err) {
      console.error("Onboarding completion error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Creating your personalized program...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={currentStepId}
          progress={progress}
          totalSteps={ONBOARDING_STEPS.length}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error completing onboarding</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Show Assessment Result or Current Step */}
        {showAssessmentResult && assessmentData ? (
          <AssessmentResult
            assessmentData={assessmentData}
            onContinue={handleComplete}
            onRetake={() => {
              setShowAssessmentResult(false);
              setAssessmentData(null);
              setCurrentStepId("fitness-assessment"); // Go back to fitness assessment
            }}
          />
        ) : (
          <OnboardingStep
            step={currentStep}
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={getPreviousStep(currentStepId) !== null}
            isLastStep={getNextStep(currentStepId) === null}
          />
        )}
      </div>
    </div>
  );
}
