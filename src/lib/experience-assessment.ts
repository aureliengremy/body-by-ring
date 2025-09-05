/**
 * Body by Rings - Experience Level Assessment
 *
 * Determines user's experience level (beginner/intermediate/advanced)
 * based on their fitness assessment responses.
 */

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface AssessmentData {
  // Fitness metrics
  can_do_pushups: number;
  can_do_pullups: number;
  can_hold_plank: number;

  // Experience background
  previous_training: string[];

  // Goals and preferences
  primary_goal: string;
  training_frequency: string;
}

interface AssessmentCriteria {
  pushups: { beginner: number; intermediate: number };
  pullups: { beginner: number; intermediate: number };
  plank: { beginner: number; intermediate: number };
}

// Daniel Vadel method thresholds for tendon-safe progression
const ASSESSMENT_CRITERIA: AssessmentCriteria = {
  pushups: { beginner: 8, intermediate: 20 }, // Can do 8+ = not complete beginner, 20+ = intermediate
  pullups: { beginner: 1, intermediate: 8 }, // 1+ = basic strength, 8+ = good strength
  plank: { beginner: 30, intermediate: 90 }, // 30s+ = basic core, 90s+ = decent core
};

/**
 * Calculate experience level based on fitness assessment
 */
export function assessExperienceLevel(data: AssessmentData): ExperienceLevel {
  let score = 0;
  let maxScore = 0;

  // 1. Strength Assessment (40% of total score)
  const strengthWeight = 0.4;

  // Push-up scoring
  if (data.can_do_pushups >= ASSESSMENT_CRITERIA.pushups.intermediate) {
    score += 2 * strengthWeight;
  } else if (data.can_do_pushups >= ASSESSMENT_CRITERIA.pushups.beginner) {
    score += 1 * strengthWeight;
  }

  // Pull-up scoring (most important indicator)
  if (data.can_do_pullups >= ASSESSMENT_CRITERIA.pullups.intermediate) {
    score += 2 * strengthWeight;
  } else if (data.can_do_pullups >= ASSESSMENT_CRITERIA.pullups.beginner) {
    score += 1 * strengthWeight;
  }

  // Plank scoring
  if (data.can_hold_plank >= ASSESSMENT_CRITERIA.plank.intermediate) {
    score += 2 * strengthWeight;
  } else if (data.can_hold_plank >= ASSESSMENT_CRITERIA.plank.beginner) {
    score += 1 * strengthWeight;
  }

  maxScore += 6 * strengthWeight;

  // 2. Training Experience (30% of total score)
  const experienceWeight = 0.3;

  if (data.previous_training.includes("bodyweight")) {
    score += 2 * experienceWeight;
  } else if (
    data.previous_training.includes("gym") ||
    data.previous_training.includes("sports") ||
    data.previous_training.includes("martial_arts")
  ) {
    score += 1 * experienceWeight;
  }

  maxScore += 2 * experienceWeight;

  // 3. Training Commitment (20% of total score)
  const commitmentWeight = 0.2;

  const frequency = parseInt(data.training_frequency);
  if (frequency >= 5) {
    score += 2 * commitmentWeight;
  } else if (frequency >= 3) {
    score += 1 * commitmentWeight;
  }

  maxScore += 2 * commitmentWeight;

  // 4. Goal Complexity (10% of total score)
  const goalWeight = 0.1;

  if (
    data.primary_goal === "skill_development" ||
    data.primary_goal === "strength"
  ) {
    score += 2 * goalWeight;
  } else if (data.primary_goal === "muscle_building") {
    score += 1 * goalWeight;
  }

  maxScore += 2 * goalWeight;

  // Calculate percentage
  const percentage = (score / maxScore) * 100;

  // Determine level with conservative approach (safety first)
  if (percentage >= 70) {
    return "advanced";
  } else if (percentage >= 40) {
    return "intermediate";
  } else {
    return "beginner";
  }
}

/**
 * Get a detailed explanation of the assessment result
 */
export function getAssessmentExplanation(
  level: ExperienceLevel,
  data: AssessmentData
): string {
  const explanations = {
    beginner: `Based on your assessment, we've designed a **beginner-friendly program** that focuses on building foundational strength safely. 

🎯 **Why this level?**
- You'll start with basic movements and progress gradually
- Emphasis on form and tendon adaptation (Daniel Vadel method)
- Perfect for building a strong foundation without injury risk

🚀 **What to expect:**
- Push-up and pull-up progressions
- Core strengthening exercises  
- 2-3 sessions per week to start
- Clear progression markers`,

    intermediate: `You've been classified as **intermediate** - you have good baseline strength and some training experience!

🎯 **Why this level?**
- You can handle more challenging variations
- Ready for structured progression systems
- Can train with moderate intensity safely

🚀 **What to expect:**
- Advanced push-up and pull-up variations
- Introduction to ring training
- 3-4 sessions per week
- Skills development alongside strength`,

    advanced: `Welcome to the **advanced program**! Your strength levels and experience qualify you for challenging progressions.

🎯 **Why this level?**
- You have excellent baseline strength
- Experience with training principles
- Ready for advanced skills and high intensity

🚀 **What to expect:**
- Advanced ring movements and skills
- Complex progression schemes
- 4-5 sessions per week
- Focus on mastery and refinement`,
  };

  return explanations[level];
}

/**
 * Get specific recommendations based on assessment
 */
export function getPersonalizedRecommendations(
  level: ExperienceLevel,
  data: AssessmentData
): {
  startingExercises: string[];
  weeklySchedule: string;
  focusAreas: string[];
  safeguards: string[];
} {
  const recommendations = {
    beginner: {
      startingExercises: [
        "Incline Push-ups",
        "Ring Rows (or Band Pull-ups)",
        "Assisted Squats",
        "Plank Hold",
      ],
      weeklySchedule: `${data.training_frequency} days/week with full rest days between sessions`,
      focusAreas: [
        "Perfect form development",
        "Tendon adaptation",
        "Basic strength building",
        "Movement consistency",
      ],
      safeguards: [
        "Start with 2-3 sets per exercise",
        "Focus on controlled movements",
        "Rest 48-72 hours between sessions",
        "Listen to your body - soreness is normal, pain is not",
      ],
    },

    intermediate: {
      startingExercises: [
        "Standard Push-ups",
        "Pull-ups (with assistance if needed)",
        "Ring Dips (assisted)",
        "L-sit Progressions",
      ],
      weeklySchedule: `${data.training_frequency} days/week with push/pull split`,
      focusAreas: [
        "Progressive overload",
        "Skill development",
        "Strength endurance",
        "Movement quality refinement",
      ],
      safeguards: [
        "Gradual load increases",
        "Proper warm-up essential",
        "Monitor RPE (Rate of Perceived Exertion)",
        "Deload weeks every 4-5 weeks",
      ],
    },

    advanced: {
      startingExercises: [
        "Handstand Push-ups",
        "Weighted Pull-ups",
        "Ring Muscle-ups",
        "Human Flag Progressions",
      ],
      weeklySchedule: `${data.training_frequency} days/week with advanced periodization`,
      focusAreas: [
        "Skill mastery",
        "Advanced progressions",
        "Strength-skill combination",
        "Performance optimization",
      ],
      safeguards: [
        "Careful periodization",
        "Active recovery sessions",
        "Technical skill practice",
        "Regular form assessment",
      ],
    },
  };

  return recommendations[level];
}
