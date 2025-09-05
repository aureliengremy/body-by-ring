/**
 * Exercise Progression System
 * 
 * Intelligently finds progressions between exercises based on:
 * - Same category (push, pull, legs, core)
 * - Difficulty progression (±1-2 levels)
 * - Movement patterns (keywords analysis)
 * - Daniel Vadel method: gradual tendon-safe progression
 */

import { supabase } from './supabase'
import type { Exercise } from '@/types/exercise'

export interface ExerciseProgression {
  exercise: Exercise
  progressionType: 'prerequisite' | 'current' | 'next' | 'advanced'
  relationship: 'easier' | 'same' | 'harder'
  difficultyGap: number
}

export interface ProgressionPath {
  prerequisites: Exercise[]  // Exercises to master first
  current: Exercise         // Current exercise
  nextSteps: Exercise[]     // Next logical progressions
  advanced: Exercise[]      // Advanced variations
  alternatives: Exercise[]  // Same level alternatives
}

// Movement pattern keywords for intelligent matching
const MOVEMENT_PATTERNS = {
  // Push patterns
  'push-up': ['wall push-up', 'incline push-up', 'knee push-up', 'push-up', 'diamond push-up', 'archer push-up', 'one-arm push-up'],
  'handstand': ['wall handstand', 'handstand wall walk', 'handstand push-up', 'handstand'],
  'dip': ['support hold', 'assisted dip', 'ring dip', 'weighted dip'],
  'planche': ['planche lean', 'frog stand', 'crow pose', 'pseudo planche push-up', 'planche push-up'],
  
  // Pull patterns  
  'pull-up': ['dead hang', 'scapular pull-up', 'negative pull-up', 'assisted pull-up', 'chin-up', 'pull-up', 'wide-grip pull-up', 'l-sit pull-up', 'weighted pull-up', 'one-arm pull-up'],
  'row': ['inverted row', 'ring row', 'archer row'],
  'muscle-up': ['pull-up', 'ring dip', 'transition work', 'muscle-up'],
  'lever': ['tuck front lever', 'front lever', 'back lever'],
  
  // Legs patterns
  'squat': ['wall sit', 'assisted squat', 'squat', 'jump squat', 'pistol squat', 'shrimp squat'],
  'single-leg': ['step-up', 'bulgarian split squat', 'single-leg glute bridge', 'pistol squat'],
  
  // Core patterns
  'plank': ['dead bug', 'plank', 'side plank', 'hollow body'],
  'l-sit': ['support hold', 'tuck l-sit', 'l-sit progression', 'l-sit'],
  'hanging': ['dead hang', 'hanging knee raise', 'hanging leg raise'],
}

/**
 * Find exercise progressions for a given exercise
 */
export async function findExerciseProgressions(exercise: Exercise): Promise<ProgressionPath> {
  try {
    // Get all exercises in the same category
    const { data: categoryExercises, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', exercise.category)
      .neq('id', exercise.id)
      .order('difficulty_level', { ascending: true })

    if (error) {
      console.error('Error fetching category exercises:', error)
      return createEmptyProgression(exercise)
    }

    const exercises = categoryExercises || []
    
    // Analyze movement patterns
    const movementPattern = detectMovementPattern(exercise.name)
    
    // Filter by movement pattern if detected
    const relatedExercises = movementPattern 
      ? exercises.filter(ex => belongsToPattern(ex.name, movementPattern))
      : exercises

    // Categorize exercises by progression type
    const progressions = categorizeProgressions(exercise, relatedExercises)
    
    return progressions

  } catch (error) {
    console.error('Error finding progressions:', error)
    return createEmptyProgression(exercise)
  }
}

/**
 * Detect the movement pattern of an exercise
 */
function detectMovementPattern(exerciseName: string): string | null {
  const nameLower = exerciseName.toLowerCase()
  
  for (const [pattern, keywords] of Object.entries(MOVEMENT_PATTERNS)) {
    if (keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
      return pattern
    }
  }
  
  return null
}

/**
 * Check if an exercise belongs to a movement pattern
 */
function belongsToPattern(exerciseName: string, pattern: string): boolean {
  const nameLower = exerciseName.toLowerCase()
  const keywords = MOVEMENT_PATTERNS[pattern as keyof typeof MOVEMENT_PATTERNS]
  
  return keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))
}

/**
 * Categorize exercises into progression types
 */
function categorizeProgressions(currentExercise: Exercise, relatedExercises: Exercise[]): ProgressionPath {
  const currentLevel = currentExercise.difficulty_level
  
  // Group by difficulty relationship
  const prerequisites = relatedExercises
    .filter(ex => ex.difficulty_level < currentLevel && ex.difficulty_level >= Math.max(1, currentLevel - 3))
    .sort((a, b) => b.difficulty_level - a.difficulty_level) // Closest to current level first
    .slice(0, 3)

  const nextSteps = relatedExercises
    .filter(ex => ex.difficulty_level > currentLevel && ex.difficulty_level <= currentLevel + 2)
    .sort((a, b) => a.difficulty_level - b.difficulty_level) // Easiest progression first
    .slice(0, 3)

  const advanced = relatedExercises
    .filter(ex => ex.difficulty_level > currentLevel + 2)
    .sort((a, b) => a.difficulty_level - b.difficulty_level)
    .slice(0, 2)

  const alternatives = relatedExercises
    .filter(ex => ex.difficulty_level === currentLevel)
    .slice(0, 3)

  return {
    prerequisites,
    current: currentExercise,
    nextSteps,
    advanced,
    alternatives
  }
}

/**
 * Create empty progression when no related exercises found
 */
function createEmptyProgression(exercise: Exercise): ProgressionPath {
  return {
    prerequisites: [],
    current: exercise,
    nextSteps: [],
    advanced: [],
    alternatives: []
  }
}

/**
 * Get progression recommendation text
 */
export function getProgressionRecommendation(path: ProgressionPath): {
  title: string
  description: string
  action: string
} {
  const currentLevel = path.current.difficulty_level
  
  if (path.prerequisites.length > 0 && currentLevel > 3) {
    return {
      title: "🔄 Master the Basics First",
      description: `Before tackling ${path.current.name}, ensure you can comfortably perform the prerequisite exercises. Building a solid foundation prevents injury and accelerates progress.`,
      action: "Practice Prerequisites"
    }
  }
  
  if (path.nextSteps.length > 0) {
    return {
      title: "🚀 Ready for the Next Challenge",
      description: `Once you can perform ${path.current.name} with perfect form for the target reps, you're ready to progress to more challenging variations.`,
      action: "Try Next Level"
    }
  }
  
  if (path.alternatives.length > 0) {
    return {
      title: "🔄 Explore Variations",
      description: `Master different variations at this level to build well-rounded strength and prevent plateaus.`,
      action: "Try Variations"
    }
  }
  
  return {
    title: "🏆 Mastery Level",
    description: `You're working with advanced exercises. Focus on perfect form, slow progressions, and listen to your body.`,
    action: "Perfect Your Form"
  }
}

/**
 * Generate a training recommendation based on user's current level
 */
export function generateTrainingRecommendation(
  exercise: Exercise, 
  progressions: ProgressionPath,
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced'
): {
  shouldAttempt: boolean
  reasoning: string
  suggestedAlternative?: Exercise
  trainingTips: string[]
} {
  const exerciseLevel = exercise.difficulty_level
  
  // Level thresholds by experience
  const levelThresholds = {
    beginner: { max: 4, comfort: 3 },
    intermediate: { max: 7, comfort: 5 },
    advanced: { max: 10, comfort: 8 }
  }
  
  const userThreshold = levelThresholds[userExperienceLevel]
  
  if (exerciseLevel <= userThreshold.comfort) {
    return {
      shouldAttempt: true,
      reasoning: `This exercise is well-suited for your ${userExperienceLevel} level. You should be able to perform it safely with proper form.`,
      trainingTips: [
        "Focus on perfect form over repetitions",
        "Start with fewer sets and build up gradually", 
        "Rest adequately between sets (60-90 seconds)"
      ]
    }
  }
  
  if (exerciseLevel <= userThreshold.max) {
    const prerequisite = progressions.prerequisites[0]
    return {
      shouldAttempt: true,
      reasoning: `This is a challenging exercise for your level. Make sure you've mastered the prerequisites first.`,
      suggestedAlternative: prerequisite,
      trainingTips: [
        "Master prerequisite exercises first",
        "Use assistance (bands, partner) initially",
        "Focus on eccentric (lowering) phase",
        "Progress very gradually"
      ]
    }
  }
  
  const alternative = progressions.prerequisites[0] || progressions.alternatives[0]
  return {
    shouldAttempt: false,
    reasoning: `This exercise is too advanced for your current level. Focus on building strength with easier variations first.`,
    suggestedAlternative: alternative,
    trainingTips: [
      "Build foundational strength first",
      "Focus on prerequisite movements",
      "Be patient - advanced skills take time",
      "Consider working with a trainer"
    ]
  }
}