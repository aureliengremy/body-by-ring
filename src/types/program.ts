import type { ExperienceLevel, FitnessGoal, TrainingFrequency } from './onboarding'

export type SessionType = 'push_1' | 'pull_1' | 'push_2' | 'pull_2'
export type ProgramPhase = 1 | 2 | 3
export type ProgramStatus = 'active' | 'completed' | 'paused'

export interface Program {
  id: string
  user_id: string
  name: string
  phase: ProgramPhase
  cycle_number: number
  status: ProgramStatus
  started_at: string
  completed_at?: string
  created_at: string
}

export interface Workout {
  id: string
  program_id: string
  week_number: number          // 1-5 (week 5 is deload)
  session_type: SessionType
  is_deload: boolean
  started_at?: string
  completed_at?: string
  notes?: string
  created_at: string
}

export interface Set {
  id: string
  workout_id: string
  exercise_id: string
  set_number: number
  target_reps_min?: number
  target_reps_max?: number
  actual_reps?: number
  rpe?: number                 // 6-10 scale
  tempo: string                // e.g., "30X1"
  notes?: string
  completed_at?: string
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  category: 'push' | 'pull' | 'legs' | 'core'
  difficulty_level: number    // 1-10
  instructions: string
  video_url?: string
  created_at: string
}

// Program generation parameters
export interface ProgramGenerationParams {
  experience_level: ExperienceLevel
  primary_goal: FitnessGoal
  training_frequency: TrainingFrequency
  available_equipment: string[]
  can_do_pushups: number
  can_do_pullups: number
  can_hold_plank: number
}

// Weekly program structure
export interface WeeklyProgram {
  week_number: number
  is_deload: boolean
  sessions: {
    session_type: SessionType
    exercises: {
      exercise_id: string
      sets: number
      reps_min: number
      reps_max: number
      tempo: string
      rest_seconds: number
    }[]
  }[]
}

// Program template based on experience level and goals
export interface ProgramTemplate {
  name: string
  description: string
  phases: {
    phase: ProgramPhase
    duration_weeks: number
    focus: string
    weeks: WeeklyProgram[]
  }[]
}

// Exercise selection criteria
export interface ExerciseSelection {
  push_exercises: {
    primary: string[]      // Main compound movements
    secondary: string[]    // Assistance exercises
    skill: string[]        // Skill work
  }
  pull_exercises: {
    primary: string[]
    secondary: string[]
    skill: string[]
  }
  legs_exercises: {
    primary: string[]
    secondary: string[]
  }
  core_exercises: {
    primary: string[]
    secondary: string[]
  }
}

// Training parameters by experience level
export const LEVEL_PARAMETERS = {
  beginner: {
    sets_per_exercise: { min: 2, max: 3 },
    reps_range: { min: 5, max: 12 },
    rest_seconds: { strength: 120, endurance: 60 },
    sessions_per_week: { min: 2, max: 3 },
    exercises_per_session: { min: 4, max: 6 }
  },
  intermediate: {
    sets_per_exercise: { min: 3, max: 4 },
    reps_range: { min: 6, max: 15 },
    rest_seconds: { strength: 150, endurance: 90 },
    sessions_per_week: { min: 3, max: 4 },
    exercises_per_session: { min: 5, max: 7 }
  },
  advanced: {
    sets_per_exercise: { min: 3, max: 5 },
    reps_range: { min: 5, max: 20 },
    rest_seconds: { strength: 180, endurance: 120 },
    sessions_per_week: { min: 4, max: 6 },
    exercises_per_session: { min: 6, max: 8 }
  }
} as const

// Goal-specific modifications
export const GOAL_MODIFIERS = {
  strength: {
    rep_adjustment: -2,        // Lower reps for strength
    rest_multiplier: 1.2,      // More rest
    intensity_focus: 'high'
  },
  muscle_building: {
    rep_adjustment: 2,         // Higher reps for hypertrophy
    rest_multiplier: 1.0,      // Standard rest
    intensity_focus: 'moderate'
  },
  endurance: {
    rep_adjustment: 5,         // Much higher reps
    rest_multiplier: 0.7,      // Less rest
    intensity_focus: 'low'
  },
  skill_development: {
    rep_adjustment: -3,        // Lower reps for skill work
    rest_multiplier: 1.5,      // More rest for skill practice
    intensity_focus: 'technique'
  },
  weight_loss: {
    rep_adjustment: 3,         // Higher reps for metabolic effect
    rest_multiplier: 0.8,      // Less rest
    intensity_focus: 'metabolic'
  },
  general_fitness: {
    rep_adjustment: 0,         // Standard reps
    rest_multiplier: 1.0,      // Standard rest
    intensity_focus: 'balanced'
  }
} as const