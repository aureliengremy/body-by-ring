'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Gift,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Crown
} from 'lucide-react'
import { LEVEL_DEFINITIONS } from '@/lib/gamification'

interface OnboardingStep {
  id: string
  title: string
  description: string
  xpReward: number
  completed: boolean
  required: boolean
  icon: string
}

interface GamifiedOnboardingProps {
  currentStep?: number
  onStepComplete?: (stepId: string, xpGained: number) => void
  onComplete?: () => void
}

export function GamifiedOnboarding({ 
  currentStep = 0, 
  onStepComplete,
  onComplete 
}: GamifiedOnboardingProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [totalXp, setTotalXp] = useState(0)

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Créer votre profil',
      description: 'Renseignez vos informations de base pour personnaliser votre expérience',
      xpReward: 50,
      completed: false,
      required: true,
      icon: '👤'
    },
    {
      id: 'goals',
      title: 'Définir vos objectifs',
      description: 'Choisissez vos objectifs fitness pour un programme adapté',
      xpReward: 75,
      completed: false,
      required: true,
      icon: '🎯'
    },
    {
      id: 'program',
      title: 'Générer votre programme',
      description: 'Votre programme personnalisé basé sur vos objectifs',
      xpReward: 100,
      completed: false,
      required: true,
      icon: '📋'
    },
    {
      id: 'first_achievement',
      title: 'Premier succès !',
      description: 'Débloquez votre premier achievement',
      xpReward: 25,
      completed: false,
      required: false,
      icon: '🏆'
    },
    {
      id: 'level_unlock',
      title: 'Niveau 2 débloqué !',
      description: 'Accédez aux fonctionnalités du niveau Apprenti',
      xpReward: 0,
      completed: false,
      required: false,
      icon: '⭐'
    }
  ]

  const completeStep = (stepId: string) => {
    const step = onboardingSteps.find(s => s.id === stepId)
    if (!step || completedSteps.has(stepId)) return

    const newCompletedSteps = new Set(completedSteps)
    newCompletedSteps.add(stepId)
    setCompletedSteps(newCompletedSteps)

    const newTotalXp = totalXp + step.xpReward
    setTotalXp(newTotalXp)

    onStepComplete?.(stepId, step.xpReward)

    // Vérifier si level 2 est débloqué
    if (newTotalXp >= 100 && !completedSteps.has('level_unlock')) {
      setTimeout(() => {
        const levelUpSteps = new Set(newCompletedSteps)
        levelUpSteps.add('level_unlock')
        setCompletedSteps(levelUpSteps)
      }, 1000)
    }

    // Vérifier si l'onboarding est terminé
    const requiredSteps = onboardingSteps.filter(s => s.required)
    const completedRequiredSteps = requiredSteps.filter(s => newCompletedSteps.has(s.id))
    
    if (completedRequiredSteps.length === requiredSteps.length) {
      setTimeout(() => {
        onComplete?.()
      }, 2000)
    }
  }

  const currentLevel = LEVEL_DEFINITIONS.find(level => 
    totalXp >= level.minXp && totalXp <= level.maxXp
  ) || LEVEL_DEFINITIONS[0]

  const progressPercentage = (completedSteps.size / onboardingSteps.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec progression */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-8 w-8 text-purple-600" />
            Bienvenue dans Body by Rings !
          </CardTitle>
          <CardDescription className="text-lg">
            Configurons votre espace d&apos;entraînement et débloquez vos premiers rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalXp}</div>
                <div className="text-sm text-gray-600">XP total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{currentLevel.icon}</div>
                <div className="text-sm font-medium">{currentLevel.title}</div>
              </div>
              <Badge className={currentLevel.color}>
                Niveau {currentLevel.level}
              </Badge>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium mb-1">
                Progression: {Math.round(progressPercentage)}%
              </div>
              <Progress value={progressPercentage} className="w-32 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étapes d'onboarding */}
      <div className="grid gap-4">
        {onboardingSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isActive = !isCompleted && (index === 0 || completedSteps.has(onboardingSteps[index - 1]?.id))
          const isLocked = !isCompleted && !isActive

          return (
            <Card
              key={step.id}
              className={`transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : isActive
                  ? 'border-blue-500 shadow-md'
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Icône et status */}
                  <div className="relative">
                    <div className={`text-4xl ${
                      isCompleted
                        ? ''
                        : isLocked
                        ? 'grayscale'
                        : ''
                    }`}>
                      {step.icon}
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">
                          Requis
                        </Badge>
                      )}
                      {step.xpReward > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          +{step.xpReward} XP
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{step.description}</p>

                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Complété ! {step.xpReward > 0 && `+${step.xpReward} XP gagné`}
                      </div>
                    ) : isActive ? (
                      <Button
                        onClick={() => completeStep(step.id)}
                        className="flex items-center gap-2"
                      >
                        Compléter cette étape
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Complétez l&apos;étape précédente pour débloquer
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Récompenses à débloquer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Récompenses à débloquer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Premier succès</h4>
              <p className="text-sm text-gray-600">Complétez votre profil</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Niveau Apprenti</h4>
              <p className="text-sm text-gray-600">Atteignez 100 XP</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Première série</h4>
              <p className="text-sm text-gray-600">Commencez votre première séance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression vers niveau suivant */}
      {totalXp < LEVEL_DEFINITIONS[1].minXp && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Progression vers Niveau 2</span>
              <span className="text-sm text-gray-600">
                {totalXp} / {LEVEL_DEFINITIONS[1].minXp} XP
              </span>
            </div>
            <Progress
              value={(totalXp / LEVEL_DEFINITIONS[1].minXp) * 100}
              className="h-3"
            />
            <p className="text-xs text-gray-600 mt-2">
              Plus que {LEVEL_DEFINITIONS[1].minXp - totalXp} XP pour débloquer de nouvelles fonctionnalités !
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}