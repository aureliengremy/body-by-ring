import { supabase } from './supabase'
import type { 
  ProgramGenerationParams, 
  WeeklyProgram, 
  SessionType, 
  ExerciseSelection,
  ProgramPhase
} from '@/types/program'
import { LEVEL_PARAMETERS, GOAL_MODIFIERS } from '@/types/program'
import { PhaseManager, type PhaseConfig } from './program-phases'

// Exercise database (we'll expand this based on our SQL data)
const EXERCISE_LIBRARY: ExerciseSelection = {
  push_exercises: {
    primary: ['Push-ups', 'Pike Push-ups', 'Handstand Push-ups', 'Ring Dips'],
    secondary: ['Incline Push-ups', 'Wall Handstand Hold', 'Support Hold'],
    skill: ['Handstand Practice', 'L-sit Progression', 'Planche Progression']
  },
  pull_exercises: {
    primary: ['Pull-ups', 'Chin-ups', 'Ring Rows', 'Muscle-ups'],
    secondary: ['Negative Pull-ups', 'Assisted Pull-ups', 'Dead Hangs'],
    skill: ['Front Lever Progression', 'Back Lever Progression']
  },
  legs_exercises: {
    primary: ['Squats', 'Pistol Squats', 'Lunges', 'Single Leg Glute Bridges'],
    secondary: ['Wall Sit', 'Calf Raises', 'Step-ups']
  },
  core_exercises: {
    primary: ['L-sit', 'Plank', 'Hollow Body Hold', 'V-ups'],
    secondary: ['Dead Bug', 'Bicycle Crunches', 'Russian Twists']
  }
}

export class ProgramGenerator {
  private params: ProgramGenerationParams
  private exercises: any[] = []
  private currentPhase: ProgramPhase
  private phaseConfig: PhaseConfig

  constructor(params: ProgramGenerationParams) {
    this.params = params
    this.currentPhase = PhaseManager.getPhaseForUser(params)
    this.phaseConfig = PhaseManager.getPhaseConfig(this.currentPhase)
  }

  async initialize() {
    // Fetch exercises from database
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('difficulty_level', { ascending: true })

    if (error) {
      console.error('Error fetching exercises:', error)
      // Fallback to basic exercises if database fails
      this.exercises = []
    } else {
      this.exercises = exercises || []
    }
  }

  // Main program generation function
  async generateProgram(userId: string): Promise<string> {
    await this.initialize()

    // Create program record with phase information
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: userId,
        name: `Body by Rings - ${this.phaseConfig.name}`,
        phase: this.currentPhase,
        cycle_number: 1,
        status: 'active'
      })
      .select()
      .single()

    if (programError) {
      throw new Error('Failed to create program: ' + programError.message)
    }

    // Generate full 5-week cycle (4 progression weeks + 1 deload week)
    const workouts = this.generateFullCycle()
    
    // Insert workouts into database
    for (const weekData of workouts) {
      for (const sessionData of weekData.sessions) {
        await this.createWorkoutSession(
          program.id, 
          weekData.week_number, 
          sessionData.session_type,
          sessionData.exercises,
          weekData.is_deload
        )
      }
    }

    return program.id
  }

  // Generate complete 5-week cycle (4 progression + 1 deload)
  private generateFullCycle(): WeeklyProgram[] {
    const weeks: WeeklyProgram[] = []

    // Weeks 1-4: Progressive overload
    for (let week = 1; week <= 4; week++) {
      const weeklyProgram: WeeklyProgram = {
        week_number: week,
        is_deload: false,
        sessions: this.generateWeeklySessions(week) // Pass week number for progression
      }
      weeks.push(weeklyProgram)
    }

    // Week 5: Deload week
    const deloadWeek: WeeklyProgram = {
      week_number: 5,
      is_deload: true,
      sessions: this.generateDeloadSessions()
    }
    weeks.push(deloadWeek)

    return weeks
  }

  // Generate weekly workout structure (kept for backward compatibility)
  private generateWeeklyWorkouts(numWeeks: number): WeeklyProgram[] {
    return this.generateFullCycle().slice(0, numWeeks)
  }

  // Generate sessions for a week based on training frequency and progression
  private generateWeeklySessions(weekNumber: number = 1) {
    const frequency = this.params.training_frequency
    const sessions: { session_type: SessionType; exercises: any[] }[] = []

    // Basic 2-3 day split: Push/Pull alternating
    if (frequency <= 3) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generatePushSession(1, weekNumber) },
        { session_type: 'pull_1', exercises: this.generatePullSession(1, weekNumber) }
      )
      if (frequency >= 3) {
        sessions.push(
          { session_type: 'push_2', exercises: this.generatePushSession(2, weekNumber) }
        )
      }
    }

    // 4+ day split: Full push/pull split
    if (frequency >= 4) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generatePushSession(1, weekNumber) },
        { session_type: 'pull_1', exercises: this.generatePullSession(1, weekNumber) },
        { session_type: 'push_2', exercises: this.generatePushSession(2, weekNumber) },
        { session_type: 'pull_2', exercises: this.generatePullSession(2, weekNumber) }
      )
    }

    return sessions
  }

  // Generate deload sessions (reduced volume and intensity)
  private generateDeloadSessions() {
    const frequency = this.params.training_frequency
    const sessions: { session_type: SessionType; exercises: any[] }[] = []

    // Deload sessions are lighter versions with 50% volume
    if (frequency <= 3) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generateDeloadPushSession(1) },
        { session_type: 'pull_1', exercises: this.generateDeloadPullSession(1) }
      )
      if (frequency >= 3) {
        sessions.push(
          { session_type: 'push_2', exercises: this.generateDeloadPushSession(2) }
        )
      }
    }

    if (frequency >= 4) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generateDeloadPushSession(1) },
        { session_type: 'pull_1', exercises: this.generateDeloadPullSession(1) },
        { session_type: 'push_2', exercises: this.generateDeloadPushSession(2) },
        { session_type: 'pull_2', exercises: this.generateDeloadPullSession(2) }
      )
    }

    return sessions
  }

  // Generate push session exercises with weekly progression
  private generatePushSession(sessionNumber: 1 | 2, weekNumber: number = 1) {
    const baseLevelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]
    
    // Apply phase adjustments to base parameters
    const levelParams = PhaseManager.getPhaseAdjustedParams(baseLevelParams, this.currentPhase, goalMods)

    const exercises = []

    // Primary push exercise
    const primaryExercise = this.selectExercise('push', 'primary')
    if (primaryExercise) {
      exercises.push(this.createExerciseSet(primaryExercise, levelParams, goalMods, true, weekNumber))
    }

    // Secondary push exercises
    const numSecondary = sessionNumber === 1 ? 2 : 1
    for (let i = 0; i < numSecondary; i++) {
      const secondaryExercise = this.selectExercise('push', 'secondary')
      if (secondaryExercise) {
        exercises.push(this.createExerciseSet(secondaryExercise, levelParams, goalMods, false, weekNumber))
      }
    }

    // Core work for push days
    const coreExercise = this.selectExercise('core', 'primary')
    if (coreExercise) {
      exercises.push(this.createExerciseSet(coreExercise, levelParams, goalMods, false, weekNumber))
    }

    // Skill work if goal is skill development
    if (this.params.primary_goal === 'skill_development') {
      const skillExercise = this.selectExercise('push', 'skill')
      if (skillExercise) {
        exercises.push(this.createExerciseSet(skillExercise, levelParams, goalMods, false, weekNumber))
      }
    }

    return exercises
  }

  // Generate pull session exercises with weekly progression
  private generatePullSession(sessionNumber: 1 | 2, weekNumber: number = 1) {
    const baseLevelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]
    
    // Apply phase adjustments to base parameters
    const levelParams = PhaseManager.getPhaseAdjustedParams(baseLevelParams, this.currentPhase, goalMods)

    const exercises = []

    // Primary pull exercise
    const primaryExercise = this.selectExercise('pull', 'primary')
    if (primaryExercise) {
      exercises.push(this.createExerciseSet(primaryExercise, levelParams, goalMods, true, weekNumber))
    }

    // Secondary pull exercises
    const numSecondary = sessionNumber === 1 ? 2 : 1
    for (let i = 0; i < numSecondary; i++) {
      const secondaryExercise = this.selectExercise('pull', 'secondary')
      if (secondaryExercise) {
        exercises.push(this.createExerciseSet(secondaryExercise, levelParams, goalMods, false, weekNumber))
      }
    }

    // Legs work for pull days
    const legsExercise = this.selectExercise('legs', 'primary')
    if (legsExercise) {
      exercises.push(this.createExerciseSet(legsExercise, levelParams, goalMods, false, weekNumber))
    }

    // Skill work if goal is skill development
    if (this.params.primary_goal === 'skill_development') {
      const skillExercise = this.selectExercise('pull', 'skill')
      if (skillExercise) {
        exercises.push(this.createExerciseSet(skillExercise, levelParams, goalMods, false, weekNumber))
      }
    }

    return exercises
  }

  // Select appropriate exercise based on user level and available equipment
  private selectExercise(category: keyof ExerciseSelection, type: 'primary' | 'secondary' | 'skill') {
    // Try to find from database first
    const dbExercises = this.exercises.filter(ex => ex.category === category.replace('_exercises', ''))
    
    if (dbExercises.length > 0) {
      // Filter by difficulty level
      const maxDifficulty = this.params.experience_level === 'beginner' ? 4 : 
                            this.params.experience_level === 'intermediate' ? 7 : 10
      
      const suitableExercises = dbExercises.filter(ex => ex.difficulty_level <= maxDifficulty)
      
      if (suitableExercises.length > 0) {
        // Select based on user's current ability
        return this.selectByAbility(suitableExercises, category)
      }
    }

    // Fallback to exercise library
    const exerciseList = EXERCISE_LIBRARY[category][type]
    return exerciseList.length > 0 ? { name: exerciseList[0], id: null } : null
  }

  // Select exercise based on user's demonstrated ability
  private selectByAbility(exercises: any[], category: keyof ExerciseSelection) {
    if (category === 'push_exercises') {
      if (this.params.can_do_pushups === 0) {
        return exercises.find(ex => ex.name.includes('Incline') || ex.name.includes('Wall'))
      } else if (this.params.can_do_pushups < 5) {
        return exercises.find(ex => ex.name === 'Push-ups')
      } else {
        return exercises.find(ex => ex.name === 'Push-ups' || ex.name === 'Pike Push-ups')
      }
    }

    if (category === 'pull_exercises') {
      if (this.params.can_do_pullups === 0) {
        return exercises.find(ex => ex.name.includes('Row') || ex.name.includes('Negative'))
      } else if (this.params.can_do_pullups < 3) {
        return exercises.find(ex => ex.name === 'Chin-ups')
      } else {
        return exercises.find(ex => ex.name === 'Pull-ups')
      }
    }

    // Default selection
    return exercises[0]
  }

  // Create exercise set configuration with weekly progression
  private createExerciseSet(exercise: any, levelParams: any, goalMods: any, isPrimary: boolean, weekNumber: number = 1) {
    const baseReps = levelParams.reps_range
    const adjustedReps = {
      min: Math.max(1, baseReps.min + goalMods.rep_adjustment),
      max: Math.max(2, baseReps.max + goalMods.rep_adjustment)
    }

    // Progressive overload: Add 1 rep per week for primary exercises, every 2 weeks for secondary
    const progressionRate = isPrimary ? 1 : 0.5
    const progressionIncrease = Math.floor((weekNumber - 1) * progressionRate)

    const finalReps = {
      min: adjustedReps.min + progressionIncrease,
      max: adjustedReps.max + progressionIncrease
    }

    const baseSets = isPrimary ? levelParams.sets_per_exercise.max : levelParams.sets_per_exercise.min
    const restSeconds = Math.round(levelParams.rest_seconds.strength * goalMods.rest_multiplier)

    return {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: baseSets,
      reps_min: finalReps.min,
      reps_max: finalReps.max,
      tempo: '30X1', // 3 second eccentric, 0 pause, explosive concentric, 1 second pause
      rest_seconds: restSeconds,
      week_number: weekNumber
    }
  }

  // Generate deload push session (50% volume)
  private generateDeloadPushSession(sessionNumber: 1 | 2) {
    const levelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]

    const exercises = []

    // Primary push exercise with reduced volume
    const primaryExercise = this.selectExercise('push', 'primary')
    if (primaryExercise) {
      exercises.push(this.createDeloadExerciseSet(primaryExercise, levelParams, goalMods, true))
    }

    // Reduced secondary work
    const secondaryExercise = this.selectExercise('push', 'secondary')
    if (secondaryExercise) {
      exercises.push(this.createDeloadExerciseSet(secondaryExercise, levelParams, goalMods, false))
    }

    // Light core work
    const coreExercise = this.selectExercise('core', 'primary')
    if (coreExercise) {
      exercises.push(this.createDeloadExerciseSet(coreExercise, levelParams, goalMods, false))
    }

    return exercises
  }

  // Generate deload pull session (50% volume)
  private generateDeloadPullSession(sessionNumber: 1 | 2) {
    const levelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]

    const exercises = []

    // Primary pull exercise with reduced volume
    const primaryExercise = this.selectExercise('pull', 'primary')
    if (primaryExercise) {
      exercises.push(this.createDeloadExerciseSet(primaryExercise, levelParams, goalMods, true))
    }

    // Reduced secondary work
    const secondaryExercise = this.selectExercise('pull', 'secondary')
    if (secondaryExercise) {
      exercises.push(this.createDeloadExerciseSet(secondaryExercise, levelParams, goalMods, false))
    }

    // Light legs work
    const legsExercise = this.selectExercise('legs', 'primary')
    if (legsExercise) {
      exercises.push(this.createDeloadExerciseSet(legsExercise, levelParams, goalMods, false))
    }

    return exercises
  }

  // Create deload exercise set (50% volume, easier intensities)
  private createDeloadExerciseSet(exercise: any, levelParams: any, goalMods: any, isPrimary: boolean) {
    const baseReps = levelParams.reps_range
    const adjustedReps = {
      min: Math.max(1, Math.floor((baseReps.min + goalMods.rep_adjustment) * 0.6)), // 60% reps
      max: Math.max(2, Math.floor((baseReps.max + goalMods.rep_adjustment) * 0.6))
    }

    const baseSets = Math.max(1, Math.floor((isPrimary ? levelParams.sets_per_exercise.max : levelParams.sets_per_exercise.min) * 0.5)) // 50% sets
    const restSeconds = Math.round(levelParams.rest_seconds.strength * goalMods.rest_multiplier * 0.8) // 20% less rest

    return {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: baseSets,
      reps_min: adjustedReps.min,
      reps_max: adjustedReps.max,
      tempo: '20X1', // Faster tempo for deload
      rest_seconds: restSeconds,
      week_number: 5, // Always week 5
      is_deload: true
    }
  }

  // Create workout session in database
  private async createWorkoutSession(
    programId: string, 
    weekNumber: number, 
    sessionType: SessionType,
    exercises: any[],
    isDeload: boolean
  ) {
    // Create workout record
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        program_id: programId,
        week_number: weekNumber,
        session_type: sessionType,
        is_deload: isDeload
      })
      .select()
      .single()

    if (workoutError) {
      console.error('Error creating workout:', workoutError)
      return
    }

    // Create sets for each exercise
    for (const exercise of exercises) {
      for (let setNum = 1; setNum <= exercise.sets; setNum++) {
        await supabase.from('sets').insert({
          workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          set_number: setNum,
          target_reps_min: exercise.reps_min,
          target_reps_max: exercise.reps_max,
          tempo: exercise.tempo
        })
      }
    }
  }
}