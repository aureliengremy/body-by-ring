'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from '@/lib/i18n'
import {
  Achievement,
  ACHIEVEMENT_DEFINITIONS,
  AchievementSystem as AchievementLogic
} from '@/lib/achievements'
import {
  Trophy,
  Star,
  Lock,
  Unlock,
  Target,
  Medal,
  Crown,
  Zap,
  Award
} from 'lucide-react'

interface UserAchievement extends Achievement {
  isUnlocked: boolean
  progress: number
  unlockedAt?: string
}

export function AchievementSystem() {
  const t = useTranslations('achievementSystem')
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [userStats, setUserStats] = useState({
    totalWorkouts: 45,
    currentStreak: 7,
    weeklyWorkouts: 4,
    monthlyWorkouts: 16,
    totalVolume: 2800,
    weeklyVolume: 320,
    monthlyVolume: 1200,
    averageRpe: 7.5,
    weeklyAverageRpe: 6.8,
    exerciseMaxes: {
      'Pull-ups': 12,
      'Push-ups': 25,
      'Dips': 8,
      'Human Flag': 0
    },
    completedGoals: 2
  })

  useEffect(() => {
    // Process achievements with user stats
    const processedAchievements: UserAchievement[] = ACHIEVEMENT_DEFINITIONS.map(achievement => {
      const progress = AchievementLogic.getAchievementProgress(achievement, userStats)
      const isUnlocked = progress >= 100
      
      return {
        ...achievement,
        isUnlocked,
        progress,
        unlockedAt: isUnlocked ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      }
    })

    setAchievements(processedAchievements)
  }, [userStats])

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity
    return categoryMatch && rarityMatch
  })

  const unlockedAchievements = achievements.filter(a => a.isUnlocked)
  const totalProgress = achievements.length > 0 
    ? achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length 
    : 0

  const categories = [
    { value: 'all', label: t('all') },
    { value: 'strength', label: t('strength') },
    { value: 'consistency', label: t('consistency') },
    { value: 'volume', label: t('volume') },
    { value: 'milestone', label: t('milestone') },
    { value: 'streak', label: 'streak' },
    { value: 'skill', label: t('skill') }
  ]
  const rarities = [
    { value: 'all', label: t('all') },
    { value: 'common', label: t('common') },
    { value: 'rare', label: t('rare') },
    { value: 'epic', label: t('epic') },
    { value: 'legendary', label: t('legendary') }
  ]

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />
      case 'rare': return <Medal className="h-4 w-4" />
      case 'epic': return <Award className="h-4 w-4" />
      case 'legendary': return <Crown className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            {t('title')}
          </h2>
          <p className="text-gray-600">
            {t('unlockBadges')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">
              {t('unlocked')} / {achievements.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(totalProgress)}%
            </div>
            <div className="text-sm text-gray-600">
              {t('overallProgress')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {unlockedAchievements.filter(a => a.rarity === 'epic' || a.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-gray-600">
              {t('rareAchievements')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {userStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              {t('currentStreak')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{t('achievementProgress')}</span>
            <span className="text-sm text-gray-600">
              {unlockedAchievements.length} / {achievements.length} {t('unlocked')}
            </span>
          </div>
          <Progress value={(unlockedAchievements.length / achievements.length) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('category')}</span>
          <div className="flex gap-1">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="capitalize"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('rarity')}</span>
          <div className="flex gap-1">
            {rarities.map(rarity => (
              <Button
                key={rarity.value}
                variant={selectedRarity === rarity.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRarity(rarity.value)}
                className="capitalize"
              >
                {rarity.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('allAchievements')}</TabsTrigger>
          <TabsTrigger value="unlocked">{t('unlocked')}</TabsTrigger>
          <TabsTrigger value="locked">{t('inProgress')}</TabsTrigger>
          <TabsTrigger value="recent">{t('recentlyUnlocked')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`text-4xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{achievement.title}</h3>
                        <Badge className={AchievementLogic.getRarityColor(achievement.rarity)}>
                          {getRarityIcon(achievement.rarity)}
                          {achievement.rarity}
                        </Badge>
                        <Badge className={AchievementLogic.getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                        {achievement.isUnlocked ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Unlock className="h-3 w-3 mr-1" />
                            {t('unlocked')}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            {t('locked')}
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{achievement.description}</p>

                      {/* Progress */}
                      {!achievement.isUnlocked && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{t('progress')}</span>
                            <span className="text-sm text-gray-600">
                              {achievement.progress}%
                            </span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}

                      {/* Requirements */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">{t('requirements')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {achievement.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req.type.replace('_', ' ')}: {req.value}
                              {req.exercise && ` (${req.exercise})`}
                              {req.timeframe && ` / ${req.timeframe}`}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Reward */}
                      {achievement.reward && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-sm">
                            <span className="font-medium text-blue-900">Reward: </span>
                            <span className="text-blue-800">{achievement.reward.value}</span>
                          </div>
                        </div>
                      )}

                      {/* Unlock Date */}
                      {achievement.unlockedAt && (
                        <div className="mt-3 text-xs text-gray-600">
                          {t('unlockedOn')} {formatDate(achievement.unlockedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-4">
          <div className="grid gap-4">
            {filteredAchievements
              .filter(a => a.isUnlocked)
              .map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge className={AchievementLogic.getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <div className="text-xs text-gray-600 mt-1">
                            Unlocked {formatDate(achievement.unlockedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid gap-4">
            {filteredAchievements
              .filter(a => !a.isUnlocked)
              .sort((a, b) => b.progress - a.progress)
              .map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl grayscale opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge className={AchievementLogic.getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{t('progress')}</span>
                          <span className="text-xs text-gray-600">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {filteredAchievements
              .filter(a => a.isUnlocked && a.unlockedAt)
              .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
              .slice(0, 10)
              .map((achievement) => (
                <Card 
                  key={achievement.id}
                  className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            {t('new')}
                          </Badge>
                          <Badge className={AchievementLogic.getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{achievement.description}</p>
                        <div className="text-xs text-gray-600 mt-1">
                          Unlocked {formatDate(achievement.unlockedAt!)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}