export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  difficulty_level: number  // 1-10
  instructions: string
  video_url?: string
  image_url?: string
  created_at: string
}

export interface ExerciseProgression {
  id: string
  exercise_id: string
  previous_exercise_id?: string  // What exercise this progresses from
  next_exercise_id?: string      // What exercise this progresses to
  progression_type: 'easier' | 'harder' | 'variation'
  description: string
}

export interface ExerciseFilter {
  category?: ExerciseCategory[]
  difficulty_min?: number
  difficulty_max?: number
  search_term?: string
}

export interface ExerciseSortOption {
  field: 'name' | 'difficulty_level' | 'category'
  direction: 'asc' | 'desc'
}

// Exercise difficulty descriptions for UI
export const DIFFICULTY_LABELS = {
  1: { label: 'Beginner', color: 'green', description: 'Perfect for first-time learners' },
  2: { label: 'Beginner+', color: 'green', description: 'Building basic strength' },
  3: { label: 'Easy', color: 'blue', description: 'Foundation movements' },
  4: { label: 'Easy+', color: 'blue', description: 'Comfortable with basics' },
  5: { label: 'Intermediate', color: 'yellow', description: 'Solid foundation needed' },
  6: { label: 'Intermediate+', color: 'yellow', description: 'Good strength base' },
  7: { label: 'Challenging', color: 'orange', description: 'Advanced movements' },
  8: { label: 'Hard', color: 'red', description: 'High skill requirement' },
  9: { label: 'Expert', color: 'purple', description: 'Mastery level' },
  10: { label: 'Elite', color: 'purple', description: 'World-class difficulty' }
} as const

// Category information for UI
export const CATEGORY_INFO = {
  push: {
    name: 'Push',
    emoji: '💪',
    description: 'Upper body pushing movements',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    color: 'blue'
  },
  pull: {
    name: 'Pull', 
    emoji: '🎯',
    description: 'Upper body pulling movements',
    muscles: ['Lats', 'Rhomboids', 'Biceps'],
    color: 'green'
  },
  legs: {
    name: 'Legs',
    emoji: '🦵',
    description: 'Lower body movements',
    muscles: ['Quadriceps', 'Glutes', 'Calves'],
    color: 'purple'
  },
  core: {
    name: 'Core',
    emoji: '🔥',
    description: 'Core stability and strength',
    muscles: ['Abs', 'Obliques', 'Lower back'],
    color: 'orange'
  }
} as const

// Equipment tags
export const EQUIPMENT_TAGS = [
  'Bodyweight Only',
  'Gymnastics Rings',
  'Pull-up Bar',
  'Parallettes',
  'Wall',
  'Resistance Bands'
] as const

export type EquipmentTag = typeof EQUIPMENT_TAGS[number]

// Enhanced exercise interface with additional metadata
export interface ExerciseWithMetadata extends Exercise {
  equipment_needed: EquipmentTag[]
  muscles_primary: string[]
  muscles_secondary: string[]
  prerequisites?: string[]  // Other exercises that should be mastered first
  progressions?: {
    easier?: Exercise
    harder?: Exercise
    variations?: Exercise[]
  }
}

// Filter and search utilities
export function filterExercises(
  exercises: Exercise[],
  filter: ExerciseFilter
): Exercise[] {
  return exercises.filter(exercise => {
    // Category filter
    if (filter.category && filter.category.length > 0) {
      if (!filter.category.includes(exercise.category)) {
        return false
      }
    }

    // Difficulty range filter
    if (filter.difficulty_min !== undefined) {
      if (exercise.difficulty_level < filter.difficulty_min) {
        return false
      }
    }
    if (filter.difficulty_max !== undefined) {
      if (exercise.difficulty_level > filter.difficulty_max) {
        return false
      }
    }

    // Search term filter
    if (filter.search_term) {
      const searchLower = filter.search_term.toLowerCase()
      const nameMatch = exercise.name.toLowerCase().includes(searchLower)
      const instructionsMatch = exercise.instructions.toLowerCase().includes(searchLower)
      
      if (!nameMatch && !instructionsMatch) {
        return false
      }
    }

    return true
  })
}

export function sortExercises(
  exercises: Exercise[],
  sort: ExerciseSortOption
): Exercise[] {
  return [...exercises].sort((a, b) => {
    let aValue: any = a[sort.field]
    let bValue: any = b[sort.field]

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sort.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}

// Get difficulty color class for Tailwind
export function getDifficultyColorClass(level: number): string {
  const difficulty = DIFFICULTY_LABELS[level as keyof typeof DIFFICULTY_LABELS]
  if (!difficulty) return 'gray'
  
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200', 
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  }
  
  return colorMap[difficulty.color] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Get category color class for Tailwind
export function getCategoryColorClass(category: ExerciseCategory): string {
  const categoryInfo = CATEGORY_INFO[category]
  
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800'
  }
  
  return colorMap[categoryInfo.color] || 'bg-gray-100 text-gray-800'
}