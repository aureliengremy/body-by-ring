import type { ProgramGenerationParams, ProgramPhase } from '@/types/program'
import { LEVEL_PARAMETERS, GOAL_MODIFIERS } from '@/types/program'

// Program phase configurations based on Daniel Vadel methodology
export interface PhaseConfig {
  phase: ProgramPhase
  name: string
  description: string
  duration_cycles: number  // Number of 5-week cycles
  focus: string
  intensity_percentage: number
  volume_multiplier: number
  complexity_level: number // 1-5 scale
}

// Three-phase progression system
export const PHASE_CONFIGURATIONS: Record<ProgramPhase, PhaseConfig> = {
  1: {
    phase: 1,
    name: "Foundation Phase",
    description: "Build base strength and movement quality",
    duration_cycles: 2, // 10 weeks
    focus: "Movement patterns, basic strength, tendon conditioning",
    intensity_percentage: 70,
    volume_multiplier: 1.0,
    complexity_level: 1
  },
  2: {
    phase: 2,
    name: "Development Phase", 
    description: "Increase strength and introduce skill elements",
    duration_cycles: 3, // 15 weeks
    focus: "Progressive overload, skill introduction, power development",
    intensity_percentage: 85,
    volume_multiplier: 1.2,
    complexity_level: 3
  },
  3: {
    phase: 3,
    name: "Mastery Phase",
    description: "Advanced skills and maximum strength",
    duration_cycles: 2, // 10 weeks
    focus: "Advanced skills, peak strength, movement mastery",
    intensity_percentage: 95,
    volume_multiplier: 1.1,
    complexity_level: 5
  }
}

// Experience level to starting phase mapping
export const STARTING_PHASE_BY_LEVEL = {
  beginner: 1,
  intermediate: 1, // Even intermediates start at phase 1 for proper foundation
  advanced: 2      // Advanced can start at phase 2 if they have experience
} as const

// Phase progression logic
export class PhaseManager {
  static getPhaseForUser(params: ProgramGenerationParams): ProgramPhase {
    const basePhase = STARTING_PHASE_BY_LEVEL[params.experience_level]
    
    // Advanced users with good skill foundation can start at phase 2
    if (params.experience_level === 'advanced' && 
        params.can_do_pullups >= 8 && 
        params.can_do_pushups >= 15 &&
        params.can_hold_plank >= 60) {
      return 2
    }
    
    return basePhase
  }

  static getPhaseConfig(phase: ProgramPhase): PhaseConfig {
    return PHASE_CONFIGURATIONS[phase]
  }

  static shouldProgressToNextPhase(
    currentPhase: ProgramPhase,
    cyclesCompleted: number,
    userProgress: {
      strength_increase: number // Percentage increase in key movements
      consistency: number       // Workout completion rate
      skill_mastery: number    // Skill achievement level (1-5)
    }
  ): boolean {
    const config = PHASE_CONFIGURATIONS[currentPhase]
    
    // Must complete minimum cycles
    if (cyclesCompleted < config.duration_cycles) {
      return false
    }
    
    // Check progression criteria
    const minStrengthIncrease = currentPhase === 1 ? 25 : currentPhase === 2 ? 15 : 10
    const minConsistency = 0.8 // 80% workout completion
    const minSkillLevel = currentPhase
    
    return (
      userProgress.strength_increase >= minStrengthIncrease &&
      userProgress.consistency >= minConsistency &&
      userProgress.skill_mastery >= minSkillLevel
    )
  }

  static getNextPhase(currentPhase: ProgramPhase): ProgramPhase | null {
    if (currentPhase < 3) {
      return (currentPhase + 1) as ProgramPhase
    }
    return null // Max phase reached
  }

  // Modify base parameters based on phase
  static getPhaseAdjustedParams(
    baseParams: any,
    phase: ProgramPhase,
    goalMods: any
  ) {
    const config = PHASE_CONFIGURATIONS[phase]
    
    return {
      ...baseParams,
      sets_per_exercise: {
        min: Math.round(baseParams.sets_per_exercise.min * config.volume_multiplier),
        max: Math.round(baseParams.sets_per_exercise.max * config.volume_multiplier)
      },
      reps_range: {
        min: Math.round(baseParams.reps_range.min * (config.intensity_percentage / 100)),
        max: Math.round(baseParams.reps_range.max * (config.intensity_percentage / 100))
      },
      rest_seconds: {
        strength: Math.round(baseParams.rest_seconds.strength * (1 + config.complexity_level * 0.1)),
        endurance: Math.round(baseParams.rest_seconds.endurance * (1 + config.complexity_level * 0.1))
      },
      exercises_per_session: {
        min: baseParams.exercises_per_session.min + Math.floor(config.complexity_level / 2),
        max: baseParams.exercises_per_session.max + Math.floor(config.complexity_level / 2)
      }
    }
  }

  // Get phase-appropriate exercises
  static getPhaseExercises(phase: ProgramPhase) {
    switch (phase) {
      case 1: // Foundation
        return {
          push_primary: ['Push-ups', 'Incline Push-ups', 'Pike Push-ups'],
          pull_primary: ['Ring Rows', 'Negative Pull-ups', 'Assisted Pull-ups'],
          skill_focus: ['Support Hold', 'Dead Hang', 'Wall Handstand'],
          complexity: 'basic'
        }
      
      case 2: // Development  
        return {
          push_primary: ['Push-ups', 'Pike Push-ups', 'Ring Dips', 'Archer Push-ups'],
          pull_primary: ['Pull-ups', 'Chin-ups', 'Ring Rows', 'Commando Pull-ups'],
          skill_focus: ['L-sit Progression', 'Handstand Push-up Progression', 'Front Lever Negatives'],
          complexity: 'intermediate'
        }
        
      case 3: // Mastery
        return {
          push_primary: ['Handstand Push-ups', 'Ring Dips', 'Planche Push-ups', 'One-Arm Push-up Progression'],
          pull_primary: ['Muscle-ups', 'One-Arm Pull-up Progression', 'Front Lever', 'Weighted Pull-ups'],
          skill_focus: ['Planche Progression', 'Front Lever', 'Back Lever', 'Human Flag'],
          complexity: 'advanced'
        }
      
      default:
        return PHASE_CONFIGURATIONS[1] // Fallback to phase 1
    }
  }
}