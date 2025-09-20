import { 
  GamificationSystem, 
  LEVEL_DEFINITIONS 
} from '../gamification'

describe('GamificationSystem', () => {
  describe('calculateXpFromWorkout', () => {
    it('should calculate correct XP for completed workout', () => {
      const xp = GamificationSystem.calculateXpFromWorkout(
        5, // completed sets
        8, // average RPE
        60, // duration in minutes
        false // is personal best
      )
      
      // Base: 25 (5 sets * 5), RPE bonus: 10, Duration bonus: 10
      // Total: 45 XP
      expect(xp).toBe(45)
    })

    it('should give bonus XP for high intensity workouts', () => {
      const highXP = GamificationSystem.calculateXpFromWorkout(
        6, // completed sets
        9.5, // high RPE
        45, // duration
        false
      )

      const normalXP = GamificationSystem.calculateXpFromWorkout(
        6, // completed sets
        7, // normal RPE
        45, // duration
        false
      )

      expect(highXP).toBeGreaterThan(normalXP)
    })

    it('should give bonus XP for personal bests', () => {
      const normalXP = GamificationSystem.calculateXpFromWorkout(
        5, // completed sets
        7, // RPE
        30, // duration
        false // not a personal best
      )

      const personalBestXP = GamificationSystem.calculateXpFromWorkout(
        5, // completed sets
        7, // RPE
        30, // duration
        true // is a personal best
      )

      expect(personalBestXP).toBeGreaterThan(normalXP)
      expect(personalBestXP - normalXP).toBe(25) // Personal best bonus
    })
  })

  describe('getUserLevel', () => {
    it('should return correct level for given XP', () => {
      expect(GamificationSystem.getUserLevel(0)).toEqual(LEVEL_DEFINITIONS[0]) // Débutant
      expect(GamificationSystem.getUserLevel(50)).toEqual(LEVEL_DEFINITIONS[0])
      expect(GamificationSystem.getUserLevel(100)).toEqual(LEVEL_DEFINITIONS[1]) // Apprenti
      expect(GamificationSystem.getUserLevel(250)).toEqual(LEVEL_DEFINITIONS[2]) // Pratiquant
      expect(GamificationSystem.getUserLevel(500)).toEqual(LEVEL_DEFINITIONS[3]) // Athlète
      expect(GamificationSystem.getUserLevel(1000)).toEqual(LEVEL_DEFINITIONS[4]) // Expert
      expect(GamificationSystem.getUserLevel(2000)).toEqual(LEVEL_DEFINITIONS[5]) // Maître
      expect(GamificationSystem.getUserLevel(5000)).toEqual(LEVEL_DEFINITIONS[6]) // Légende
    })

    it('should return highest level for excessive XP', () => {
      const result = GamificationSystem.getUserLevel(10000)
      expect(result).toEqual(LEVEL_DEFINITIONS[6]) // Légende
    })
  })

  describe('generateWeeklyChallenge', () => {
    it('should generate appropriate challenge for beginner level', () => {
      const challenge = GamificationSystem.generateWeeklyChallenge(1) // Level 1
      
      expect(challenge).toHaveProperty('title')
      expect(challenge).toHaveProperty('description')
      expect(challenge).toHaveProperty('target')
      expect(challenge).toHaveProperty('xpReward')
      expect(challenge).toHaveProperty('type')
      
      // Beginner challenges should be achievable
      expect(challenge.target).toBeGreaterThan(0)
      expect(challenge.xpReward).toBeGreaterThan(0)
    })

    it('should generate more challenging goals for advanced users', () => {
      // Generate multiple challenges to account for randomness
      const beginnerChallenges = Array.from({ length: 5 }, () => 
        GamificationSystem.generateWeeklyChallenge(1) // Level 1
      )
      const advancedChallenges = Array.from({ length: 5 }, () => 
        GamificationSystem.generateWeeklyChallenge(5) // Level 5
      )
      
      const avgBeginnerTarget = beginnerChallenges.reduce((sum, c) => sum + c.target, 0) / beginnerChallenges.length
      const avgAdvancedTarget = advancedChallenges.reduce((sum, c) => sum + c.target, 0) / advancedChallenges.length
      
      const avgBeginnerReward = beginnerChallenges.reduce((sum, c) => sum + c.xpReward, 0) / beginnerChallenges.length
      const avgAdvancedReward = advancedChallenges.reduce((sum, c) => sum + c.xpReward, 0) / advancedChallenges.length
      
      expect(avgAdvancedTarget).toBeGreaterThan(avgBeginnerTarget)
      expect(avgAdvancedReward).toBeGreaterThan(avgBeginnerReward)
    })

    it('should include variety in challenge types', () => {
      const challenges = Array.from({ length: 10 }, () => 
        GamificationSystem.generateWeeklyChallenge(3) // Level 3
      )
      
      const challengeTypes = challenges.map(c => c.type)
      const uniqueTypes = new Set(challengeTypes)
      
      // Should have multiple challenge types
      expect(uniqueTypes.size).toBeGreaterThan(1)
    })
  })

  describe('getProgressToNextLevel', () => {
    it('should calculate progress to next level correctly', () => {
      const progress = GamificationSystem.getProgressToNextLevel(150) // Apprenti level with some progress
      
      expect(progress.currentLevel).toEqual(LEVEL_DEFINITIONS[1]) // Apprenti
      expect(progress.nextLevel).toEqual(LEVEL_DEFINITIONS[2]) // Pratiquant
      expect(progress.progress).toBeGreaterThan(0)
      expect(progress.xpToNext).toBeGreaterThan(0)
    })

    it('should return 100% progress for max level', () => {
      const progress = GamificationSystem.getProgressToNextLevel(5000) // Légende level
      
      expect(progress.currentLevel).toEqual(LEVEL_DEFINITIONS[6]) // Légende
      expect(progress.nextLevel).toBeNull()
      expect(progress.progress).toBe(100)
      expect(progress.xpToNext).toBe(0)
    })

  })

  describe('updateStreak', () => {
    it('should start streak for first workout', () => {
      const initialStreak = {
        current: 0,
        longest: 0,
        lastWorkoutDate: null,
        isActive: false,
        freezesUsed: 0,
        maxFreezes: 3
      }
      
      const today = new Date()
      const updatedStreak = GamificationSystem.updateStreak(initialStreak, today)
      
      expect(updatedStreak.current).toBe(1)
      expect(updatedStreak.longest).toBe(1)
      expect(updatedStreak.isActive).toBe(true)
    })

    it('should increment streak for consecutive days', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const currentStreak = {
        current: 1,
        longest: 1,
        lastWorkoutDate: yesterday.toISOString(),
        isActive: true,
        freezesUsed: 0,
        maxFreezes: 3
      }
      
      const today = new Date()
      const updatedStreak = GamificationSystem.updateStreak(currentStreak, today)
      
      expect(updatedStreak.current).toBe(2)
      expect(updatedStreak.longest).toBe(2)
      expect(updatedStreak.isActive).toBe(true)
    })

    it('should reset streak after gap of more than one day', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      const currentStreak = {
        current: 5,
        longest: 5,
        lastWorkoutDate: threeDaysAgo.toISOString(),
        isActive: true,
        freezesUsed: 0,
        maxFreezes: 3
      }
      
      const today = new Date()
      const updatedStreak = GamificationSystem.updateStreak(currentStreak, today)
      
      expect(updatedStreak.current).toBe(1) // Reset to 1
      expect(updatedStreak.longest).toBe(5) // Keep longest streak
      expect(updatedStreak.isActive).toBe(true)
    })
  })
})