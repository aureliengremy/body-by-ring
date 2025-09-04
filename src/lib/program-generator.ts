import { supabase } from './supabase'
import type { 
  ProgramGenerationParams, 
  WeeklyProgram, 
  SessionType, 
  ExerciseSelection,
  LEVEL_PARAMETERS,
  GOAL_MODIFIERS 
} from '@/types/program'
import { LEVEL_PARAMETERS, GOAL_MODIFIERS } from '@/types/program'

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

  constructor(params: ProgramGenerationParams) {
    this.params = params
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

    // Create program record
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: userId,
        name: 'Body by Rings - Phase 1',
        phase: 1,
        cycle_number: 1,
        status: 'active'
      })
      .select()
      .single()

    if (programError) {
      throw new Error('Failed to create program: ' + programError.message)
    }

    // Generate 4 weeks of workouts (week 5 will be deload, added later)
    const workouts = this.generateWeeklyWorkouts(4)
    
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

  // Generate weekly workout structure
  private generateWeeklyWorkouts(numWeeks: number): WeeklyProgram[] {
    const weeks: WeeklyProgram[] = []

    for (let week = 1; week <= numWeeks; week++) {
      const weeklyProgram: WeeklyProgram = {
        week_number: week,
        is_deload: false,
        sessions: this.generateWeeklySessions()
      }
      weeks.push(weeklyProgram)
    }

    return weeks
  }

  // Generate sessions for a week based on training frequency
  private generateWeeklySessions() {
    const frequency = this.params.training_frequency
    const sessions: { session_type: SessionType; exercises: any[] }[] = []

    // Basic 2-3 day split: Push/Pull alternating
    if (frequency <= 3) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generatePushSession(1) },
        { session_type: 'pull_1', exercises: this.generatePullSession(1) }
      )
      if (frequency >= 3) {
        sessions.push(
          { session_type: 'push_2', exercises: this.generatePushSession(2) }
        )
      }
    }

    // 4+ day split: Full push/pull split
    if (frequency >= 4) {
      sessions.push(
        { session_type: 'push_1', exercises: this.generatePushSession(1) },
        { session_type: 'pull_1', exercises: this.generatePullSession(1) },
        { session_type: 'push_2', exercises: this.generatePushSession(2) },
        { session_type: 'pull_2', exercises: this.generatePullSession(2) }
      )
    }

    return sessions
  }

  // Generate push session exercises
  private generatePushSession(sessionNumber: 1 | 2) {
    const levelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]

    const exercises = []

    // Primary push exercise
    const primaryExercise = this.selectExercise('push', 'primary')
    if (primaryExercise) {
      exercises.push(this.createExerciseSet(primaryExercise, levelParams, goalMods, true))
    }

    // Secondary push exercises
    const numSecondary = sessionNumber === 1 ? 2 : 1
    for (let i = 0; i < numSecondary; i++) {
      const secondaryExercise = this.selectExercise('push', 'secondary')
      if (secondaryExercise) {
        exercises.push(this.createExerciseSet(secondaryExercise, levelParams, goalMods, false))
      }
    }

    // Core work for push days
    const coreExercise = this.selectExercise('core', 'primary')
    if (coreExercise) {
      exercises.push(this.createExerciseSet(coreExercise, levelParams, goalMods, false))
    }

    // Skill work if goal is skill development
    if (this.params.primary_goal === 'skill_development') {
      const skillExercise = this.selectExercise('push', 'skill')
      if (skillExercise) {
        exercises.push(this.createExerciseSet(skillExercise, levelParams, goalMods, false))
      }
    }

    return exercises
  }

  // Generate pull session exercises
  private generatePullSession(sessionNumber: 1 | 2) {
    const levelParams = LEVEL_PARAMETERS[this.params.experience_level]
    const goalMods = GOAL_MODIFIERS[this.params.primary_goal]

    const exercises = []

    // Primary pull exercise
    const primaryExercise = this.selectExercise('pull', 'primary')
    if (primaryExercise) {
      exercises.push(this.createExerciseSet(primaryExercise, levelParams, goalMods, true))
    }

    // Secondary pull exercises
    const numSecondary = sessionNumber === 1 ? 2 : 1
    for (let i = 0; i < numSecondary; i++) {
      const secondaryExercise = this.selectExercise('pull', 'secondary')
      if (secondaryExercise) {
        exercises.push(this.createExerciseSet(secondaryExercise, levelParams, goalMods, false))
      }
    }

    // Legs work for pull days
    const legsExercise = this.selectExercise('legs', 'primary')
    if (legsExercise) {
      exercises.push(this.createExerciseSet(legsExercise, levelParams, goalMods, false))
    }

    // Skill work if goal is skill development
    if (this.params.primary_goal === 'skill_development') {
      const skillExercise = this.selectExercise('pull', 'skill')
      if (skillExercise) {
        exercises.push(this.createExerciseSet(skillExercise, levelParams, goalMods, false))
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

  // Create exercise set configuration
  private createExerciseSet(exercise: any, levelParams: any, goalMods: any, isPrimary: boolean) {
    const baseReps = levelParams.reps_range
    const adjustedReps = {
      min: Math.max(1, baseReps.min + goalMods.rep_adjustment),
      max: Math.max(2, baseReps.max + goalMods.rep_adjustment)
    }

    const baseSets = isPrimary ? levelParams.sets_per_exercise.max : levelParams.sets_per_exercise.min
    const restSeconds = Math.round(levelParams.rest_seconds.strength * goalMods.rest_multiplier)

    return {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: baseSets,
      reps_min: adjustedReps.min,
      reps_max: adjustedReps.max,
      tempo: '30X1', // 3 second eccentric, 0 pause, explosive concentric, 1 second pause
      rest_seconds: restSeconds
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