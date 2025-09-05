'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/types/exercise'
import { DIFFICULTY_LABELS, getDifficultyColorClass } from '@/types/exercise'
import { 
  findExerciseProgressions, 
  getProgressionRecommendation,
  generateTrainingRecommendation,
  type ProgressionPath 
} from '@/lib/exercise-progressions'

interface ProgressionVisualizationProps {
  exercise: Exercise
  userExperienceLevel?: 'beginner' | 'intermediate' | 'advanced'
}

export function ProgressionVisualization({ 
  exercise, 
  userExperienceLevel = 'beginner' 
}: ProgressionVisualizationProps) {
  const router = useRouter()
  const [progressions, setProgressions] = useState<ProgressionPath | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgressions() {
      try {
        const path = await findExerciseProgressions(exercise)
        setProgressions(path)
      } catch (error) {
        console.error('Error loading progressions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProgressions()
  }, [exercise])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading progressions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressions) {
    return null
  }

  const recommendation = getProgressionRecommendation(progressions)
  const training = generateTrainingRecommendation(exercise, progressions, userExperienceLevel)

  return (
    <div className="space-y-6">
      {/* Training Recommendation */}
      <Card className={`${training.shouldAttempt ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {training.shouldAttempt ? '✅' : '⚠️'} 
            Training Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{training.reasoning}</p>
          
          {training.suggestedAlternative && (
            <div className="bg-white p-4 rounded-lg border mb-4">
              <h4 className="font-medium mb-2">Suggested Alternative:</h4>
              <div 
                onClick={() => router.push(`/exercises/${training.suggestedAlternative!.id}`)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <div>
                  <div className="font-medium">{training.suggestedAlternative.name}</div>
                  <div className="text-sm text-gray-600">
                    Level {training.suggestedAlternative.difficulty_level} - Build your foundation here
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColorClass(training.suggestedAlternative.difficulty_level)}`}>
                  L{training.suggestedAlternative.difficulty_level}
                </span>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Training Tips:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {training.trainingTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Progression Path Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>{recommendation.title}</CardTitle>
          <p className="text-gray-600">{recommendation.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Prerequisites */}
            {progressions.prerequisites.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  ⬅️ Prerequisites (Master These First)
                </h4>
                <div className="grid gap-2">
                  {progressions.prerequisites.map((prereq) => (
                    <ExerciseProgressionCard 
                      key={prereq.id} 
                      exercise={prereq} 
                      type="prerequisite"
                      onClick={() => router.push(`/exercises/${prereq.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Exercise */}
            <div className="flex justify-center">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 w-full max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">🎯 YOU ARE HERE</div>
                  <div className="font-semibold text-gray-800">{exercise.name}</div>
                  <div className="text-sm text-gray-600">
                    Level {exercise.difficulty_level} - {DIFFICULTY_LABELS[exercise.difficulty_level as keyof typeof DIFFICULTY_LABELS]?.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {progressions.nextSteps.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  ➡️ Next Challenges
                </h4>
                <div className="grid gap-2">
                  {progressions.nextSteps.map((next) => (
                    <ExerciseProgressionCard 
                      key={next.id} 
                      exercise={next} 
                      type="next"
                      onClick={() => router.push(`/exercises/${next.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Exercises */}
            {progressions.advanced.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  🚀 Advanced Goals
                </h4>
                <div className="grid gap-2">
                  {progressions.advanced.map((adv) => (
                    <ExerciseProgressionCard 
                      key={adv.id} 
                      exercise={adv} 
                      type="advanced"
                      onClick={() => router.push(`/exercises/${adv.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {progressions.alternatives.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🔄 Same Level Variations
                </h4>
                <div className="grid gap-2">
                  {progressions.alternatives.map((alt) => (
                    <ExerciseProgressionCard 
                      key={alt.id} 
                      exercise={alt} 
                      type="alternative"
                      onClick={() => router.push(`/exercises/${alt.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ExerciseProgressionCardProps {
  exercise: Exercise
  type: 'prerequisite' | 'current' | 'next' | 'advanced' | 'alternative'
  onClick: () => void
}

function ExerciseProgressionCard({ exercise, type, onClick }: ExerciseProgressionCardProps) {
  const difficultyInfo = DIFFICULTY_LABELS[exercise.difficulty_level as keyof typeof DIFFICULTY_LABELS]
  
  const typeStyles = {
    prerequisite: 'border-green-200 bg-green-50 hover:bg-green-100',
    current: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
    next: 'border-orange-200 bg-orange-50 hover:bg-orange-100', 
    advanced: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    alternative: 'border-gray-200 bg-gray-50 hover:bg-gray-100'
  }

  const typeIcons = {
    prerequisite: '✅',
    current: '🎯',
    next: '⬆️',
    advanced: '🚀',
    alternative: '🔄'
  }

  return (
    <div 
      onClick={onClick}
      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${typeStyles[type]}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span>{typeIcons[type]}</span>
            <span className="font-medium">{exercise.name}</span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            {exercise.instructions.substring(0, 80)}...
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ml-2 ${getDifficultyColorClass(exercise.difficulty_level)}`}>
          L{exercise.difficulty_level}
        </span>
      </div>
      
      <div className="text-xs text-gray-500">
        {difficultyInfo?.description}
      </div>
    </div>
  )
}