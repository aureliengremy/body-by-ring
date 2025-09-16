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
    <div className=\"max-w-4xl mx-auto space-y-6\">\n      {/* Header avec progression */}\n      <Card className=\"bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200\">\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2 text-2xl\">\n            <Crown className=\"h-8 w-8 text-purple-600\" />\n            Bienvenue dans Body by Rings !\n          </CardTitle>\n          <CardDescription className=\"text-lg\">\n            Configurons votre espace d'entraînement et débloquez vos premiers rewards\n          </CardDescription>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <div className=\"flex items-center justify-between\">\n            <div className=\"flex items-center gap-4\">\n              <div className=\"text-center\">\n                <div className=\"text-2xl font-bold text-purple-600\">{totalXp}</div>\n                <div className=\"text-sm text-gray-600\">XP total</div>\n              </div>\n              <div className=\"text-center\">\n                <div className=\"text-2xl\">{currentLevel.icon}</div>\n                <div className=\"text-sm font-medium\">{currentLevel.title}</div>\n              </div>\n              <Badge className={currentLevel.color}>\n                Niveau {currentLevel.level}\n              </Badge>\n            </div>\n            \n            <div className=\"text-right\">\n              <div className=\"text-sm font-medium mb-1\">\n                Progression: {Math.round(progressPercentage)}%\n              </div>\n              <Progress value={progressPercentage} className=\"w-32 h-2\" />\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Étapes d'onboarding */}\n      <div className=\"grid gap-4\">\n        {onboardingSteps.map((step, index) => {\n          const isCompleted = completedSteps.has(step.id)\n          const isActive = !isCompleted && (index === 0 || completedSteps.has(onboardingSteps[index - 1]?.id))\n          const isLocked = !isCompleted && !isActive\n\n          return (\n            <Card \n              key={step.id}\n              className={`transition-all duration-300 ${\n                isCompleted \n                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' \n                  : isActive \n                  ? 'border-blue-500 shadow-md' \n                  : 'opacity-60'\n              }`}\n            >\n              <CardContent className=\"p-6\">\n                <div className=\"flex items-center gap-4\">\n                  {/* Icône et status */}\n                  <div className=\"relative\">\n                    <div className={`text-4xl ${\n                      isCompleted \n                        ? '' \n                        : isLocked \n                        ? 'grayscale' \n                        : ''\n                    }`}>\n                      {step.icon}\n                    </div>\n                    {isCompleted && (\n                      <div className=\"absolute -top-1 -right-1\">\n                        <CheckCircle className=\"h-6 w-6 text-green-500 bg-white rounded-full\" />\n                      </div>\n                    )}\n                  </div>\n\n                  {/* Contenu */}\n                  <div className=\"flex-1\">\n                    <div className=\"flex items-center gap-2 mb-2\">\n                      <h3 className=\"text-lg font-semibold\">{step.title}</h3>\n                      {step.required && (\n                        <Badge variant=\"outline\" className=\"text-xs\">\n                          Requis\n                        </Badge>\n                      )}\n                      {step.xpReward > 0 && (\n                        <Badge className=\"bg-yellow-100 text-yellow-800\">\n                          <Star className=\"h-3 w-3 mr-1\" />\n                          +{step.xpReward} XP\n                        </Badge>\n                      )}\n                    </div>\n                    <p className=\"text-gray-700 mb-3\">{step.description}</p>\n                    \n                    {isCompleted ? (\n                      <div className=\"flex items-center gap-2 text-green-600 font-medium\">\n                        <CheckCircle className=\"h-4 w-4\" />\n                        Complété ! {step.xpReward > 0 && `+${step.xpReward} XP gagné`}\n                      </div>\n                    ) : isActive ? (\n                      <Button \n                        onClick={() => completeStep(step.id)}\n                        className=\"flex items-center gap-2\"\n                      >\n                        Compléter cette étape\n                        <ArrowRight className=\"h-4 w-4\" />\n                      </Button>\n                    ) : (\n                      <div className=\"text-gray-500 text-sm\">\n                        Complétez l'étape précédente pour débloquer\n                      </div>\n                    )}\n                  </div>\n                </div>\n              </CardContent>\n            </Card>\n          )\n        })}\n      </div>\n\n      {/* Récompenses à débloquer */}\n      <Card>\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2\">\n            <Gift className=\"h-5 w-5 text-purple-600\" />\n            Récompenses à débloquer\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          <div className=\"grid md:grid-cols-3 gap-4\">\n            <div className=\"text-center p-4 border rounded-lg\">\n              <Trophy className=\"h-8 w-8 text-yellow-600 mx-auto mb-2\" />\n              <h4 className=\"font-medium mb-1\">Premier succès</h4>\n              <p className=\"text-sm text-gray-600\">Complétez votre profil</p>\n            </div>\n            \n            <div className=\"text-center p-4 border rounded-lg\">\n              <TrendingUp className=\"h-8 w-8 text-blue-600 mx-auto mb-2\" />\n              <h4 className=\"font-medium mb-1\">Niveau Apprenti</h4>\n              <p className=\"text-sm text-gray-600\">Atteignez 100 XP</p>\n            </div>\n            \n            <div className=\"text-center p-4 border rounded-lg\">\n              <Zap className=\"h-8 w-8 text-orange-600 mx-auto mb-2\" />\n              <h4 className=\"font-medium mb-1\">Première série</h4>\n              <p className=\"text-sm text-gray-600\">Commencez votre première séance</p>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Progression vers niveau suivant */}\n      {totalXp < LEVEL_DEFINITIONS[1].minXp && (\n        <Card>\n          <CardContent className=\"p-4\">\n            <div className=\"flex items-center justify-between mb-2\">\n              <span className=\"font-medium\">Progression vers Niveau 2</span>\n              <span className=\"text-sm text-gray-600\">\n                {totalXp} / {LEVEL_DEFINITIONS[1].minXp} XP\n              </span>\n            </div>\n            <Progress \n              value={(totalXp / LEVEL_DEFINITIONS[1].minXp) * 100} \n              className=\"h-3\" \n            />\n            <p className=\"text-xs text-gray-600 mt-2\">\n              Plus que {LEVEL_DEFINITIONS[1].minXp - totalXp} XP pour débloquer de nouvelles fonctionnalités !\n            </p>\n          </CardContent>\n        </Card>\n      )}\n    </div>\n  )\n}