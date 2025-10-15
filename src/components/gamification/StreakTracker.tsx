'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Flame,
  Star,
  Trophy,
  Zap,
  Target,
  Gift
} from 'lucide-react'
import { GamificationSystem, UserGameData } from '@/lib/gamification'
import { useTranslations } from '@/lib/i18n'

interface StreakTrackerProps {
  gameData: UserGameData
}

export function StreakTracker({ gameData }: StreakTrackerProps) {
  const t = useTranslations('streak')
  const levelProgress = GamificationSystem.getProgressToNextLevel(gameData.xp)

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500'
    if (streak >= 14) return 'text-orange-500'
    if (streak >= 7) return 'text-yellow-500'
    if (streak >= 3) return 'text-green-500'
    return 'text-gray-500'
  }

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { text: t('legendary'), color: 'bg-purple-100 text-purple-800' }
    if (streak >= 14) return { text: t('incredible'), color: 'bg-orange-100 text-orange-800' }
    if (streak >= 7) return { text: t('excellent'), color: 'bg-yellow-100 text-yellow-800' }
    if (streak >= 3) return { text: t('goodPace'), color: 'bg-green-100 text-green-800' }
    return { text: t('promisingStart'), color: 'bg-gray-100 text-gray-800' }
  }

  const streakBadge = getStreakBadge(gameData.streak.current)

  return (
    <div className="space-y-6">
      {/* Niveau et XP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{levelProgress.currentLevel.icon}</span>
            {t('level')} {levelProgress.currentLevel.level} - {levelProgress.currentLevel.title}
          </CardTitle>
          <CardDescription>
            {gameData.xp} {t('totalXp')} • {levelProgress.xpToNext} {t('xpForNextLevel')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression XP */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{t('progressionToLevel')} {levelProgress.nextLevel?.level || 'MAX'}</span>
              <span className="text-sm text-gray-600">{levelProgress.progress}%</span>
            </div>
            <Progress value={levelProgress.progress} className="h-3" />
          </div>

          {/* Avantages du niveau */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('unlockedBenefits')}</h4>
            <div className="flex flex-wrap gap-1">
              {levelProgress.currentLevel.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className={`h-6 w-6 ${getStreakColor(gameData.streak.current)}`} />
            {t('series')} {gameData.streak.current} {gameData.streak.current > 1 ? t('days') : t('day')}
            <Badge className={streakBadge.color}>
              {streakBadge.text}
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('personalRecord')} {gameData.streak.longest} {t('days')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visualisation des 7 derniers jours */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('last7Days')}</h4>
            <div className="flex gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const dayIndex = 6 - i
                const isActive = dayIndex < gameData.streak.current
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isActive ? <Flame className="h-4 w-4" /> : dayIndex + 1}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Messages motivationnels */}
          {gameData.streak.current > 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    {gameData.streak.current >= 7
                      ? t('incredibleConsistency')
                      : t('keepGoing')}
                  </p>
                  <p className="text-xs text-orange-700">
                    {gameData.streak.current === 1
                      ? t('goodStart')
                      : t('maintainedSeries', { days: gameData.streak.current })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Streak Protection */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{t('streakProtection')}</p>
                <p className="text-xs text-blue-700">
                  {gameData.streak.maxFreezes - gameData.streak.freezesUsed} {gameData.streak.maxFreezes - gameData.streak.freezesUsed > 1 ? t('freezesRemaining') : t('freezeRemaining')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled={gameData.streak.freezesUsed >= gameData.streak.maxFreezes}>
              <Gift className="h-4 w-4 mr-1" />
              {t('use')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Défi hebdomadaire */}
      {gameData.weeklyChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{gameData.weeklyChallenge.icon}</span>
              {t('weeklyChallenge')}
            </CardTitle>
            <CardDescription>
              {gameData.weeklyChallenge.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              {gameData.weeklyChallenge.description}
            </p>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('progression')}</span>
                <span className="text-sm text-gray-600">
                  {gameData.weeklyChallenge.current} / {gameData.weeklyChallenge.target}
                </span>
              </div>
              <Progress
                value={(gameData.weeklyChallenge.current / gameData.weeklyChallenge.target) * 100}
                className="h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">
                  {t('reward')} : {gameData.weeklyChallenge.xpReward} XP
                </span>
              </div>
              {gameData.weeklyChallenge.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <Trophy className="h-3 w-3 mr-1" />
                  {t('gamification.completed')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {gameData.totalWorkouts}
            </div>
            <div className="text-sm text-gray-600">
              {t('totalWorkouts')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {gameData.totalXpEarned}
            </div>
            <div className="text-sm text-gray-600">
              {t('totalXpEarned')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}