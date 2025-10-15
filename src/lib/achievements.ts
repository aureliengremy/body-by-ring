export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'strength' | 'consistency' | 'volume' | 'milestone' | 'streak' | 'skill'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirements: {
    type: 'workout_count' | 'streak' | 'exercise_reps' | 'total_volume' | 'rpe_average' | 'goal_completion'
    value: number
    timeframe?: string
    exercise?: string
  }[]
  reward?: {
    type: 'badge' | 'title' | 'feature_unlock'
    value: string
  }
  unlockedAt?: string
  progress?: number
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Strength Achievements
  {
    id: 'first_pullup',
    title: 'First Pull-up',
    description: 'Complete your first unassisted pull-up',
    icon: '🎯',
    category: 'strength',
    rarity: 'common',
    requirements: [
      { type: 'exercise_reps', value: 1, exercise: 'Pull-ups' }
    ],
    reward: { type: 'badge', value: 'First Pull-up Champion' }
  },
  {
    id: 'pullup_master',
    title: 'Pull-up Master',
    description: 'Achieve 15 consecutive pull-ups',
    icon: '💪',
    category: 'strength',
    rarity: 'rare',
    requirements: [
      { type: 'exercise_reps', value: 15, exercise: 'Pull-ups' }
    ],
    reward: { type: 'title', value: 'Pull-up Master' }
  },
  {
    id: 'human_flag',
    title: 'Human Flag',
    description: 'Master the human flag exercise',
    icon: '🏴',
    category: 'skill',
    rarity: 'legendary',
    requirements: [
      { type: 'exercise_reps', value: 1, exercise: 'Human Flag' }
    ],
    reward: { type: 'title', value: 'Flag Bearer' }
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Complete 100 push-ups in a single workout',
    icon: '💯',
    category: 'volume',
    rarity: 'epic',
    requirements: [
      { type: 'exercise_reps', value: 100, exercise: 'Push-ups' }
    ]
  },

  // Consistency Achievements
  {
    id: 'consistency_starter',
    title: 'Consistency Starter',
    description: 'Complete workouts 5 days in a row',
    icon: '🔥',
    category: 'consistency',
    rarity: 'common',
    requirements: [
      { type: 'streak', value: 5 }
    ]
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: 'Maintain a 30-day workout streak',
    icon: '⚡',
    category: 'streak',
    rarity: 'epic',
    requirements: [
      { type: 'streak', value: 30 }
    ],
    reward: { type: 'feature_unlock', value: 'Advanced Analytics' }
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete 4 workouts in a single week',
    icon: '⚔️',
    category: 'consistency',
    rarity: 'common',
    requirements: [
      { type: 'workout_count', value: 4, timeframe: 'week' }
    ]
  },
  {
    id: 'monthly_machine',
    title: 'Monthly Machine',
    description: 'Complete 16 workouts in a single month',
    icon: '🤖',
    category: 'consistency',
    rarity: 'rare',
    requirements: [
      { type: 'workout_count', value: 16, timeframe: 'month' }
    ]
  },

  // Volume Achievements
  {
    id: 'volume_beast',
    title: 'Volume Beast',
    description: 'Complete 1000 total reps in a month',
    icon: '🦁',
    category: 'volume',
    rarity: 'rare',
    requirements: [
      { type: 'total_volume', value: 1000, timeframe: 'month' }
    ]
  },
  {
    id: 'rep_machine',
    title: 'Rep Machine',
    description: 'Complete 500 reps in a single week',
    icon: '🚀',
    category: 'volume',
    rarity: 'common',
    requirements: [
      { type: 'total_volume', value: 500, timeframe: 'week' }
    ]
  },

  // Milestone Achievements
  {
    id: 'first_workout',
    title: 'Journey Begins',
    description: 'Complete your first workout',
    icon: '🚀',
    category: 'milestone',
    rarity: 'common',
    requirements: [
      { type: 'workout_count', value: 1 }
    ]
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Complete 100 total workouts',
    icon: '🎖️',
    category: 'milestone',
    rarity: 'epic',
    requirements: [
      { type: 'workout_count', value: 100 }
    ],
    reward: { type: 'title', value: 'Veteran Athlete' }
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Complete 365 total workouts',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    requirements: [
      { type: 'workout_count', value: 365 }
    ],
    reward: { type: 'title', value: 'Living Legend' }
  },

  // Quality/RPE Achievements
  {
    id: 'perfect_form',
    title: 'Perfect Form',
    description: 'Maintain average RPE below 7 for an entire week',
    icon: '⭐',
    category: 'skill',
    rarity: 'rare',
    requirements: [
      { type: 'rpe_average', value: 7, timeframe: 'week' }
    ]
  },


  // Goal Achievements
  {
    id: 'goal_getter',
    title: 'Goal Getter',
    description: 'Complete your first goal',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    requirements: [
      { type: 'goal_completion', value: 1 }
    ]
  },
  {
    id: 'achievement_hunter',
    title: 'Achievement Hunter',
    description: 'Complete 5 different goals',
    icon: '🏆',
    category: 'milestone',
    rarity: 'epic',
    requirements: [
      { type: 'goal_completion', value: 5 }
    ]
  }
]

export class AchievementSystem {
  static checkAchievements(userStats: {
    totalWorkouts: number
    currentStreak: number
    weeklyWorkouts: number
    monthlyWorkouts: number
    totalVolume: number
    weeklyVolume: number
    monthlyVolume: number
    averageRpe: number
    weeklyAverageRpe: number
    exerciseMaxes: Record<string, number>
    completedGoals: number
  }): Achievement[] {
    const newlyUnlocked: Achievement[] = []

    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (this.isAchievementUnlocked(achievement, userStats)) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
          progress: 100
        })
      }
    })

    return newlyUnlocked
  }

  static getAchievementProgress(
    achievement: Achievement,
    userStats: {
      totalWorkouts: number
      currentStreak: number
      weeklyWorkouts: number
      monthlyWorkouts: number
      totalVolume: number
      weeklyVolume: number
      monthlyVolume: number
      averageRpe: number
      weeklyAverageRpe: number
      exerciseMaxes: Record<string, number>
      completedGoals: number
    }
  ): number {
    let progress = 0

    achievement.requirements.forEach(req => {
      let currentValue = 0

      switch (req.type) {
        case 'workout_count':
          if (req.timeframe === 'week') currentValue = userStats.weeklyWorkouts
          else if (req.timeframe === 'month') currentValue = userStats.monthlyWorkouts
          else currentValue = userStats.totalWorkouts
          break
        case 'streak':
          currentValue = userStats.currentStreak
          break
        case 'exercise_reps':
          currentValue = userStats.exerciseMaxes[req.exercise || ''] || 0
          break
        case 'total_volume':
          if (req.timeframe === 'week') currentValue = userStats.weeklyVolume
          else if (req.timeframe === 'month') currentValue = userStats.monthlyVolume
          else currentValue = userStats.totalVolume
          break
        case 'rpe_average':
          currentValue = req.timeframe === 'week' ? userStats.weeklyAverageRpe : userStats.averageRpe
          // For RPE, we want it to be BELOW the target, so invert the logic
          progress = Math.max(0, Math.min(100, (req.value - currentValue) / req.value * 100))
          return
        case 'goal_completion':
          currentValue = userStats.completedGoals
          break
      }

      progress = Math.max(progress, Math.min(100, (currentValue / req.value) * 100))
    })

    return Math.round(progress)
  }

  private static isAchievementUnlocked(
    achievement: Achievement,
    userStats: {
      totalWorkouts: number
      currentStreak: number
      weeklyWorkouts: number
      monthlyWorkouts: number
      totalVolume: number
      weeklyVolume: number
      monthlyVolume: number
      averageRpe: number
      weeklyAverageRpe: number
      exerciseMaxes: Record<string, number>
      completedGoals: number
    }
  ): boolean {
    return achievement.requirements.every(req => {
      let currentValue = 0

      switch (req.type) {
        case 'workout_count':
          if (req.timeframe === 'week') currentValue = userStats.weeklyWorkouts
          else if (req.timeframe === 'month') currentValue = userStats.monthlyWorkouts
          else currentValue = userStats.totalWorkouts
          break
        case 'streak':
          currentValue = userStats.currentStreak
          break
        case 'exercise_reps':
          currentValue = userStats.exerciseMaxes[req.exercise || ''] || 0
          break
        case 'total_volume':
          if (req.timeframe === 'week') currentValue = userStats.weeklyVolume
          else if (req.timeframe === 'month') currentValue = userStats.monthlyVolume
          else currentValue = userStats.totalVolume
          break
        case 'rpe_average':
          currentValue = req.timeframe === 'week' ? userStats.weeklyAverageRpe : userStats.averageRpe
          return currentValue <= req.value // For RPE, we want it to be below threshold
        case 'goal_completion':
          currentValue = userStats.completedGoals
          break
      }

      return currentValue >= req.value
    })
  }

  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      case 'legendary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  static getCategoryColor(category: string): string {
    switch (category) {
      case 'strength': return 'bg-red-100 text-red-800'
      case 'consistency': return 'bg-green-100 text-green-800'
      case 'volume': return 'bg-blue-100 text-blue-800'
      case 'milestone': return 'bg-yellow-100 text-yellow-800'
      case 'streak': return 'bg-orange-100 text-orange-800'
      case 'skill': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
}