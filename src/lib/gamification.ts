export interface UserLevel {
  level: number
  title: string
  minXp: number
  maxXp: number
  color: string
  icon: string
  benefits: string[]
}

export interface StreakData {
  current: number
  longest: number
  lastWorkoutDate: string | null
  isActive: boolean
  freezesUsed: number
  maxFreezes: number
}

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  target: number
  current: number
  type: 'workouts' | 'volume' | 'streak' | 'exercises'
  xpReward: number
  icon: string
  startDate: string
  endDate: string
  completed: boolean
}

export interface UserGameData {
  xp: number
  level: number
  streak: StreakData
  weeklyChallenge: WeeklyChallenge | null
  lastLoginDate: string
  totalWorkouts: number
  totalXpEarned: number
}

export const LEVEL_DEFINITIONS: UserLevel[] = [
  {
    level: 1,
    title: 'Débutant',
    minXp: 0,
    maxXp: 99,
    color: 'bg-gray-100 text-gray-800',
    icon: '🌱',
    benefits: ['Accès aux programmes de base', 'Suivi des séances']
  },
  {
    level: 2,
    title: 'Apprenti',
    minXp: 100,
    maxXp: 249,
    color: 'bg-green-100 text-green-800',
    icon: '💪',
    benefits: ['Déblocage des exercices intermédiaires', 'Tracker de progression']
  },
  {
    level: 3,
    title: 'Pratiquant',
    minXp: 250,
    maxXp: 499,
    color: 'bg-blue-100 text-blue-800',
    icon: '🏃',
    benefits: ['Programmes personnalisés', 'Analytics détaillées']
  },
  {
    level: 4,
    title: 'Athlète',
    minXp: 500,
    maxXp: 999,
    color: 'bg-purple-100 text-purple-800',
    icon: '🏆',
    benefits: ['Exercices avancés', 'Défis hebdomadaires']
  },
  {
    level: 5,
    title: 'Expert',
    minXp: 1000,
    maxXp: 1999,
    color: 'bg-orange-100 text-orange-800',
    icon: '🔥',
    benefits: ['Programmes d\'élite', 'Coaching IA avancé']
  },
  {
    level: 6,
    title: 'Maître',
    minXp: 2000,
    maxXp: 3999,
    color: 'bg-red-100 text-red-800',
    icon: '⚡',
    benefits: ['Accès complet', 'Fonction mentor']
  },
  {
    level: 7,
    title: 'Légende',
    minXp: 4000,
    maxXp: Infinity,
    color: 'bg-yellow-100 text-yellow-800',
    icon: '👑',
    benefits: ['Statut légendaire', 'Toutes les fonctionnalités']
  }
]

export class GamificationSystem {
  static calculateXpFromWorkout(
    completedSets: number,
    avgRpe: number,
    duration: number,
    isPersonalBest: boolean = false
  ): number {
    let baseXp = completedSets * 5 // 5 XP par série complétée
    
    // Bonus pour l'intensité (RPE)
    if (avgRpe >= 8) baseXp += 10
    else if (avgRpe >= 7) baseXp += 5
    
    // Bonus pour la durée
    if (duration >= 45) baseXp += 10
    else if (duration >= 30) baseXp += 5
    
    // Bonus pour record personnel
    if (isPersonalBest) baseXp += 25
    
    return Math.round(baseXp)
  }

  static getUserLevel(xp: number): UserLevel {
    return LEVEL_DEFINITIONS.find(level => 
      xp >= level.minXp && xp <= level.maxXp
    ) || LEVEL_DEFINITIONS[0]
  }

  static getProgressToNextLevel(xp: number): {
    currentLevel: UserLevel
    nextLevel: UserLevel | null
    progress: number
    xpToNext: number
  } {
    const currentLevel = this.getUserLevel(xp)
    const nextLevelIndex = LEVEL_DEFINITIONS.findIndex(l => l.level === currentLevel.level) + 1
    const nextLevel = nextLevelIndex < LEVEL_DEFINITIONS.length 
      ? LEVEL_DEFINITIONS[nextLevelIndex] 
      : null

    if (!nextLevel) {
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        xpToNext: 0
      }
    }

    const xpInCurrentLevel = xp - currentLevel.minXp
    const xpNeededForLevel = nextLevel.minXp - currentLevel.minXp
    const progress = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
    const xpToNext = nextLevel.minXp - xp

    return {
      currentLevel,
      nextLevel,
      progress,
      xpToNext
    }
  }

  static updateStreak(
    currentStreak: StreakData,
    lastWorkoutDate: Date
  ): StreakData {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const lastWorkout = currentStreak.lastWorkoutDate 
      ? new Date(currentStreak.lastWorkoutDate)
      : null

    // Si c'est le premier workout
    if (!lastWorkout) {
      return {
        ...currentStreak,
        current: 1,
        longest: Math.max(1, currentStreak.longest),
        lastWorkoutDate: lastWorkoutDate.toISOString(),
        isActive: true
      }
    }

    const daysDiff = Math.floor(
      (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Même jour = pas de changement de streak
    if (daysDiff === 0) {
      return {
        ...currentStreak,
        lastWorkoutDate: lastWorkoutDate.toISOString()
      }
    }

    // Jour consécutif = augmente la streak
    if (daysDiff === 1) {
      const newStreak = currentStreak.current + 1
      return {
        ...currentStreak,
        current: newStreak,
        longest: Math.max(newStreak, currentStreak.longest),
        lastWorkoutDate: lastWorkoutDate.toISOString(),
        isActive: true
      }
    }

    // Plus d'un jour = streak cassée
    return {
      ...currentStreak,
      current: 1,
      lastWorkoutDate: lastWorkoutDate.toISOString(),
      isActive: true
    }
  }

  static generateWeeklyChallenge(userLevel: number): WeeklyChallenge {
    const challenges = [
      {
        type: 'workouts' as const,
        title: 'Warrior de la semaine',
        description: 'Complète {target} séances cette semaine',
        baseTarget: 3,
        icon: '🏋️‍♂️'
      },
      {
        type: 'volume' as const,
        title: 'Machine à répétitions',
        description: 'Effectue {target} répétitions au total',
        baseTarget: 200,
        icon: '💯'
      },
      {
        type: 'streak' as const,
        title: 'Constance parfaite',
        description: 'Maintiens une série de {target} jours',
        baseTarget: 5,
        icon: '🔥'
      }
    ]

    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    const target = Math.floor(challenge.baseTarget * (1 + userLevel * 0.2))
    const xpReward = target * 10

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Début de semaine
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6) // Fin de semaine

    return {
      id: `challenge_${Date.now()}`,
      title: challenge.title,
      description: challenge.description.replace('{target}', target.toString()),
      target,
      current: 0,
      type: challenge.type,
      xpReward,
      icon: challenge.icon,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      completed: false
    }
  }

  static getMotivationalMessages(streak: number, level: number): {
    title: string
    message: string
    type: 'streak' | 'level' | 'motivation'
  }[] {
    const messages = []

    // Messages de streak
    if (streak > 0) {
      if (streak === 1) {
        messages.push({
          title: 'Bon début ! 🌟',
          message: 'Tu as commencé ta série ! Continue demain pour la faire grandir.',
          type: 'streak' as const
        })
      } else if (streak === 7) {
        messages.push({
          title: 'Une semaine complète ! 🎉',
          message: 'Tu as maintenu ta série pendant 7 jours. Tu prends le rythme !',
          type: 'streak' as const
        })
      } else if (streak === 30) {
        messages.push({
          title: 'Un mois de régularité ! 🏆',
          message: 'Incroyable ! 30 jours de suite. Tu es devenu une machine !',
          type: 'streak' as const
        })
      } else if (streak % 10 === 0) {
        messages.push({
          title: `${streak} jours de suite ! 🔥`,
          message: 'Ta constance est inspirante. Continue sur cette lancée !',
          type: 'streak' as const
        })
      }
    }

    // Messages de niveau
    const currentLevel = this.getUserLevel(level * 100) // Approximation
    if (level > 1) {
      messages.push({
        title: `Niveau ${currentLevel.level} atteint ! ${currentLevel.icon}`,
        message: `Tu es maintenant ${currentLevel.title}. De nouveaux avantages t'attendent !`,
        type: 'level' as const
      })
    }

    // Messages motivationnels généraux
    const motivationalQuotes = [
      {
        title: 'Force et progression 💪',
        message: 'Chaque répétition te rapproche de tes objectifs.'
      },
      {
        title: 'Constance payante 🎯',
        message: 'Ce ne sont pas les grands efforts occasionnels, mais les petits efforts constants qui comptent.'
      },
      {
        title: 'Dépassement de soi 🚀',
        message: 'Tu es plus fort aujourd\'hui qu\'hier. Continue à te dépasser !'
      }
    ]

    if (Math.random() < 0.3) { // 30% de chance d'avoir un message motivationnel
      const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
      messages.push({
        title: quote.title,
        message: quote.message,
        type: 'motivation' as const
      })
    }

    return messages
  }

  static shouldShowStreakReminder(lastLoginDate: string): boolean {
    const lastLogin = new Date(lastLoginDate)
    const now = new Date()
    const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    
    // Rappel après 20h sans connexion
    return hoursSinceLastLogin > 20
  }
}

// Export aliases for easier import
export type GameData = UserGameData
export const calculateLevelProgress = GamificationSystem.getProgressToNextLevel