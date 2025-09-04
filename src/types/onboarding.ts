export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type FitnessGoal = 
  | 'strength' 
  | 'muscle_building' 
  | 'endurance' 
  | 'skill_development'
  | 'weight_loss'
  | 'general_fitness'

export type TrainingFrequency = 2 | 3 | 4 | 5 | 6

export interface OnboardingData {
  // Personal Info
  full_name: string
  experience_level: ExperienceLevel
  
  // Fitness Assessment
  can_do_pushups: number | null          // Max pushups in a row
  can_do_pullups: number | null          // Max pullups in a row
  can_hold_plank: number | null          // Plank hold in seconds
  
  // Goals & Preferences
  primary_goal: FitnessGoal
  training_frequency: TrainingFrequency
  available_equipment: string[]          // ['rings', 'pullup_bar', 'none']
  
  // Schedule
  preferred_workout_days: string[]       // ['monday', 'wednesday', 'friday']
  typical_workout_time: 'morning' | 'afternoon' | 'evening'
  
  // Experience Details
  previous_training: string[]            // ['gym', 'bodyweight', 'sports']
  injuries_or_limitations: string
}

export interface AssessmentQuestion {
  id: string
  type: 'number' | 'select' | 'multiselect' | 'text'
  question: string
  description?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  placeholder?: string
  required: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  questions: AssessmentQuestion[]
}

// Experience level assessment criteria
export interface LevelCriteria {
  pushups: { min: number; max: number }
  pullups: { min: number; max: number }
  plank: { min: number; max: number }      // seconds
}

export const LEVEL_CRITERIA: Record<ExperienceLevel, LevelCriteria> = {
  beginner: {
    pushups: { min: 0, max: 10 },
    pullups: { min: 0, max: 2 },
    plank: { min: 0, max: 60 }
  },
  intermediate: {
    pushups: { min: 11, max: 25 },
    pullups: { min: 3, max: 8 },
    plank: { min: 61, max: 180 }
  },
  advanced: {
    pushups: { min: 26, max: 999 },
    pullups: { min: 9, max: 999 },
    plank: { min: 181, max: 999 }
  }
}

// Calculate experience level based on performance
export function calculateExperienceLevel(
  pushups: number,
  pullups: number,
  plankSeconds: number
): ExperienceLevel {
  // Score each exercise (0 = beginner, 1 = intermediate, 2 = advanced)
  const pushupScore = pushups <= LEVEL_CRITERIA.beginner.pushups.max ? 0 :
                     pushups <= LEVEL_CRITERIA.intermediate.pushups.max ? 1 : 2
  
  const pullupScore = pullups <= LEVEL_CRITERIA.beginner.pullups.max ? 0 :
                     pullups <= LEVEL_CRITERIA.intermediate.pullups.max ? 1 : 2
  
  const plankScore = plankSeconds <= LEVEL_CRITERIA.beginner.plank.max ? 0 :
                    plankSeconds <= LEVEL_CRITERIA.intermediate.plank.max ? 1 : 2
  
  // Average the scores
  const averageScore = (pushupScore + pullupScore + plankScore) / 3
  
  // Determine level based on average
  if (averageScore < 0.7) return 'beginner'
  if (averageScore < 1.7) return 'intermediate'
  return 'advanced'
}