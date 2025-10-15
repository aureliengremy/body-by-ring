import { supabase } from './supabase'
import type {
  ProgramGenerationParams,
  WeeklyProgram,
  SessionType,
  ExerciseSelection,
  ProgramPhase,
  Exercise
} from '@/types/program'
import { LEVEL_PARAMETERS, GOAL_MODIFIERS } from '@/types/program'
import { PhaseManager, type PhaseConfig } from './program-phases'

// Type for exercises used during program generation
interface ExerciseWithPrimary {
  id: string | null
  name: string
  category?: string
  difficulty_level?: number
  instructions?: string
  video_url?: string
  created_at?: string
  isPrimary?: boolean
}

// Type for level parameters
interface LevelParams {
  sets_per_exercise: { min: number; max: number }
  reps_range: { min: number; max: number }
  rest_seconds: { strength: number; endurance: number }
  sessions_per_week: { min: number; max: number }
  exercises_per_session: { min: number; max: number }
}

// Type for goal modifiers
interface GoalMods {
  rep_adjustment: number
  rest_multiplier: number
  intensity_focus: string
}

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
  private exercises: Exercise[] = []
  private currentPhase: ProgramPhase
  private phaseConfig: PhaseConfig
  private usedExercises: Set<string> = new Set() // Track used exercises to avoid duplicates

  // Store selected exercises for consistency across weeks
  private selectedExercises: {
    push_1: ExerciseWithPrimary[]
    push_2: ExerciseWithPrimary[]
    pull_1: ExerciseWithPrimary[]
    pull_2: ExerciseWithPrimary[]
  } = {
    push_1: [],
    push_2: [],
    pull_1: [],
    pull_2: []
  }

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

    // Pre-select exercises for each session type to ensure consistency across weeks
    this.selectExercisesForAllSessions()
  }

  // Select exercises once for all sessions to ensure consistency across weeks
  private selectExercisesForAllSessions() {
    // Reset used exercises tracker
    this.usedExercises.clear()

    // Select exercises for Push 1
    this.selectedExercises.push_1 = this.selectExercisesForSession('push', 1)

    // Select exercises for Pull 1
    this.selectedExercises.pull_1 = this.selectExercisesForSession('pull', 1)

    // Select exercises for Push 2 (if frequency >= 3)
    if (this.params.training_frequency >= 3) {
      this.selectedExercises.push_2 = this.selectExercisesForSession('push', 2)
    }

    // Select exercises for Pull 2 (if frequency >= 4)
    if (this.params.training_frequency >= 4) {
      this.selectedExercises.pull_2 = this.selectExercisesForSession('pull', 2)
    }
  }

  // Select exercises for a specific session type
  private selectExercisesForSession(type: 'push' | 'pull', sessionNumber: 1 | 2): ExerciseWithPrimary[] {
    const exercises: ExerciseWithPrimary[] = []

    if (type === 'push') {
      // Primary push exercise
      const primaryExercise = this.selectExercise('push_exercises', 'primary')
      if (primaryExercise) {
        exercises.push({ ...primaryExercise, isPrimary: true })
        this.usedExercises.add(primaryExercise.id || primaryExercise.name)
      }

      // Secondary push exercises
      const numSecondary = sessionNumber === 1 ? 2 : 1
      for (let i = 0; i < numSecondary; i++) {
        const secondaryExercise = this.selectExercise('push_exercises', 'secondary')
        if (secondaryExercise) {
          exercises.push({ ...secondaryExercise, isPrimary: false })
          this.usedExercises.add(secondaryExercise.id || secondaryExercise.name)
        }
      }

      // Core work for push days
      const coreExercise = this.selectExercise('core_exercises', 'primary')
      if (coreExercise) {
        exercises.push({ ...coreExercise, isPrimary: false })
        this.usedExercises.add(coreExercise.id || coreExercise.name)
      }

      // Skill work if goal is skill development
      if (this.params.primary_goal === 'skill_development') {
        const skillExercise = this.selectExercise('push_exercises', 'skill')
        if (skillExercise) {
          exercises.push({ ...skillExercise, isPrimary: false })
          this.usedExercises.add(skillExercise.id || skillExercise.name)
        }
      }
    } else {
      // Pull session
      // Primary pull exercise
      const primaryExercise = this.selectExercise('pull_exercises', 'primary')
      if (primaryExercise) {
        exercises.push({ ...primaryExercise, isPrimary: true })
        this.usedExercises.add(primaryExercise.id || primaryExercise.name)
      }

      // Secondary pull exercises
      const numSecondary = sessionNumber === 1 ? 2 : 1
      for (let i = 0; i < numSecondary; i++) {
        const secondaryExercise = this.selectExercise('pull_exercises', 'secondary')
        if (secondaryExercise) {
          exercises.push({ ...secondaryExercise, isPrimary: false })
          this.usedExercises.add(secondaryExercise.id || secondaryExercise.name)
        }
      }

      // Legs work for pull days
      const legsExercise = this.selectExercise('legs_exercises', 'primary')
      if (legsExercise) {
        exercises.push({ ...legsExercise, isPrimary: false })
        this.usedExercises.add(legsExercise.id || legsExercise.name)
      }

      // Skill work if goal is skill development
      if (this.params.primary_goal === 'skill_development') {
        const skillExercise = this.selectExercise('pull_exercises', 'skill')
        if (skillExercise) {
          exercises.push({ ...skillExercise, isPrimary: false })
          this.usedExercises.add(skillExercise.id || skillExercise.name)
        }
      }
    }

    return exercises
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
    
    // Insert workouts into database with proper ordering
    for (const weekData of workouts) {
      for (let sessionIndex = 0; sessionIndex < weekData.sessions.length; sessionIndex++) {
        const sessionData = weekData.sessions[sessionIndex]
        await this.createWorkoutSession(
          program.id,
          weekData.week_number,
          sessionData.session_type,
          sessionData.exercises,
          weekData.is_deload,
          sessionIndex + 1 // session_order: 1, 2, 3, 4
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
    const sessions: { session_type: SessionType; exercises: ExerciseWithPrimary[] }[] = []

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
    const sessions: { session_type: SessionType; exercises: ExerciseWithPrimary[] }[] = []

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

    // Use pre-selected exercises for consistency across weeks
    const sessionKey = sessionNumber === 1 ? 'push_1' : 'push_2'
    const selectedExercises = this.selectedExercises[sessionKey]

    // Convert selected exercises to exercise sets with progression
    for (const exercise of selectedExercises) {
      exercises.push(this.createExerciseSet(exercise, levelParams, goalMods, exercise.isPrimary, weekNumber))
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

    // Use pre-selected exercises for consistency across weeks
    const sessionKey = sessionNumber === 1 ? 'pull_1' : 'pull_2'
    const selectedExercises = this.selectedExercises[sessionKey]

    // Convert selected exercises to exercise sets with progression
    for (const exercise of selectedExercises) {
      exercises.push(this.createExerciseSet(exercise, levelParams, goalMods, exercise.isPrimary, weekNumber))
    }

    return exercises
  }

  // Select appropriate exercise based on user level and available equipment
  private selectExercise(category: keyof ExerciseSelection, type: 'primary' | 'secondary' | 'skill'): ExerciseWithPrimary | null {
    // Try to find from database first
    const categoryName = category.replace('_exercises', '')
    const dbExercises = this.exercises.filter(ex => ex.category === categoryName)

    if (dbExercises.length > 0) {
      // Filter by difficulty level
      const maxDifficulty = this.params.experience_level === 'beginner' ? 4 :
                            this.params.experience_level === 'intermediate' ? 7 : 10

      let suitableExercises = dbExercises.filter(ex =>
        ex.difficulty_level <= maxDifficulty &&
        !this.usedExercises.has(ex.id)
      )

      // If all exercises have been used, reset and allow reuse
      if (suitableExercises.length === 0) {
        suitableExercises = dbExercises.filter(ex => ex.difficulty_level <= maxDifficulty)
      }

      if (suitableExercises.length > 0) {
        // Select random exercise from suitable ones
        const randomIndex = Math.floor(Math.random() * suitableExercises.length)
        return suitableExercises[randomIndex]
      }
    }

    // Fallback to exercise library
    const categoryData = EXERCISE_LIBRARY[category]
    if (!categoryData) return null

    // Check if the type exists in this category
    const exerciseList = categoryData[type as keyof typeof categoryData] as string[] | undefined
    if (!exerciseList || exerciseList.length === 0) return null

    // Find unused exercise from library
    const unusedExercises = exerciseList.filter((name: string) => !this.usedExercises.has(name))
    const availableExercises = unusedExercises.length > 0 ? unusedExercises : exerciseList

    // Select random exercise
    const randomIndex = Math.floor(Math.random() * availableExercises.length)
    return { name: availableExercises[randomIndex], id: null }
  }

  // Create exercise set configuration with weekly progression
  private createExerciseSet(exercise: ExerciseWithPrimary, levelParams: LevelParams, goalMods: GoalMods, isPrimary: boolean, weekNumber: number = 1) {
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

    // Use same exercises as regular sessions for consistency
    const sessionKey = sessionNumber === 1 ? 'push_1' : 'push_2'
    const selectedExercises = this.selectedExercises[sessionKey]

    // Convert to deload sets (reduced volume)
    for (const exercise of selectedExercises) {
      exercises.push(this.createDeloadExerciseSet(exercise, levelParams, goalMods, exercise.isPrimary))
    }

    return exercises
  }

  // Generate deload pull session (50% volume)
  private generateDeloadPullSession(sessionNumber: 1 | 2) {
    const levelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]

    const exercises = []

    // Use same exercises as regular sessions for consistency
    const sessionKey = sessionNumber === 1 ? 'pull_1' : 'pull_2'
    const selectedExercises = this.selectedExercises[sessionKey]

    // Convert to deload sets (reduced volume)
    for (const exercise of selectedExercises) {
      exercises.push(this.createDeloadExerciseSet(exercise, levelParams, goalMods, exercise.isPrimary))
    }

    return exercises
  }

  // Create deload exercise set (50% volume, easier intensities)
  private createDeloadExerciseSet(exercise: ExerciseWithPrimary, levelParams: LevelParams, goalMods: GoalMods, isPrimary: boolean) {
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
    exercises: ExerciseWithPrimary[],
    isDeload: boolean,
    sessionOrder: number
  ) {
    // Create workout record
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        program_id: programId,
        week_number: weekNumber,
        session_type: sessionType,
        is_deload: isDeload,
        session_order: sessionOrder
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