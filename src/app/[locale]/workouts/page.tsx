"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Workout, Set, Exercise } from "@/types/program";
import { CATEGORY_INFO } from "@/types/exercise";

interface WorkoutWithDetails extends Workout {
  exercises: (Exercise & { sets: Set[] })[];
}

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Load workouts
  useEffect(() => {
    async function loadWorkouts() {
      if (!user) return;

      try {
        // Get user's active program
        const { data: program } = await supabase
          .from("programs")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (!program) {
          setError(
            "No active program found. Please complete onboarding first."
          );
          return;
        }

        // Get workouts for this program
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .select(
            `
            *,
            sets (
              *,
              exercises (*)
            )
          `
          )
          .eq("program_id", program.id)
          .order("week_number", { ascending: true })
          .order("session_type", { ascending: true });

        if (workoutError) throw workoutError;

        // Transform data to group sets by exercise
        const workoutsWithDetails: WorkoutWithDetails[] =
          workoutData?.map((workout) => {
            // Group sets by exercise
            const exerciseMap = new Map();

            workout.sets?.forEach((set: { exercises: { id: string; [key: string]: unknown } }) => {
              const exercise = set.exercises;
              if (!exerciseMap.has(exercise.id)) {
                exerciseMap.set(exercise.id, {
                  ...exercise,
                  sets: [],
                });
              }
              exerciseMap.get(exercise.id).sets.push(set);
            });

            return {
              ...workout,
              exercises: Array.from(exerciseMap.values()),
            };
          }) || [];

        setWorkouts(workoutsWithDetails);
      } catch (err) {
        console.error("Error loading workouts:", err);
        setError("Failed to load workouts");
      } finally {
        setLoading(false);
      }
    }

    loadWorkouts();
  }, [user]);

  const filteredWorkouts = workouts.filter((workout) => {
    if (filter === "completed") return workout.completed_at !== null;
    if (filter === "pending") return workout.completed_at === null;
    return true;
  });

  const getSessionTypeLabel = (sessionType: string) => {
    const labels = {
      push_1: "Push Session 1",
      pull_1: "Pull Session 1",
      push_2: "Push Session 2",
      pull_2: "Pull Session 2",
    };
    return labels[sessionType as keyof typeof labels] || sessionType;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">💪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Program Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/onboarding")}>
            Create Your Program
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Workouts 🏋️
              </h1>
              <p className="text-gray-600 mt-2">
                Your personalized training sessions
              </p>
            </div>

            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              ← Dashboard
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(["all", "pending", "completed"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === filterType
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filterType === "all" && "All Workouts"}
                {filterType === "pending" && "Upcoming"}
                {filterType === "completed" && "Completed"}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {
                    workouts.filter((w) =>
                      filterType === "all"
                        ? true
                        : filterType === "completed"
                        ? w.completed_at
                        : !w.completed_at
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Workouts Grid */}
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {filter === "completed" ? "🎉" : "💪"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "completed"
                ? "No completed workouts yet"
                : "No workouts available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "completed"
                ? "Start your first workout to see your progress here"
                : "Complete your onboarding to generate your workout plan"}
            </p>
            <Button
              onClick={() => router.push("/onboarding")}
              variant="outline"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className={`${
                  workout.completed_at
                    ? "bg-green-50 border-green-200"
                    : "hover:shadow-lg"
                } transition-shadow`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">
                          {workout.session_type.startsWith("push")
                            ? "💪"
                            : "🎯"}
                        </span>
                        {getSessionTypeLabel(workout.session_type)}
                        {workout.completed_at && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Week {workout.week_number} • {workout.exercises.length}{" "}
                        exercises
                        {workout.is_deload && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Deload Week
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Exercise Preview */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        Exercises:
                      </h4>
                      <div className="space-y-1">
                        {workout.exercises.slice(0, 3).map((exercise) => {
                          const categoryInfo =
                            CATEGORY_INFO[
                              exercise.category as keyof typeof CATEGORY_INFO
                            ];
                          const totalSets = exercise.sets.length;
                          return (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span>{categoryInfo?.emoji}</span>
                                <span>{exercise.name}</span>
                              </div>
                              <span className="text-gray-500">
                                {totalSets} set{totalSets > 1 ? "s" : ""}
                              </span>
                            </div>
                          );
                        })}
                        {workout.exercises.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{workout.exercises.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workout Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Sets:</span>
                        <div className="font-medium">
                          {workout.exercises.reduce(
                            (total, ex) => total + ex.sets.length,
                            0
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Est. Time:</span>
                        <div className="font-medium">
                          {Math.round(workout.exercises.length * 8)} min
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {workout.completed_at ? (
                        <>
                          <Button variant="outline" className="flex-1" disabled>
                            Completed{" "}
                            {new Date(
                              workout.completed_at
                            ).toLocaleDateString()}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/workouts/${workout.id}/review`)
                            }
                          >
                            Review
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="flex-1"
                            onClick={() =>
                              router.push(`/workouts/${workout.id}`)
                            }
                          >
                            Start Workout
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/workouts/${workout.id}/preview`)
                            }
                          >
                            Preview
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
