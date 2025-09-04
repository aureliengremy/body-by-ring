'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Exercise } from '@/types/exercise'
import { DIFFICULTY_LABELS, CATEGORY_INFO, getDifficultyColorClass, getCategoryColorClass } from '@/types/exercise'
import { useRouter } from 'next/navigation'

interface ExerciseCardProps {
  exercise: Exercise
  showCategory?: boolean
  compact?: boolean
}

export function ExerciseCard({ exercise, showCategory = true, compact = false }: ExerciseCardProps) {
  const router = useRouter()
  
  const difficultyInfo = DIFFICULTY_LABELS[exercise.difficulty_level as keyof typeof DIFFICULTY_LABELS]
  const categoryInfo = CATEGORY_INFO[exercise.category]

  const handleViewDetails = () => {
    router.push(`/exercises/${exercise.id}`)
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColorClass(exercise.difficulty_level)}`}>
              {exercise.difficulty_level}
            </span>
          </div>
          
          {showCategory && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{categoryInfo.emoji}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColorClass(exercise.category)}`}>
                {categoryInfo.name}
              </span>
            </div>
          )}

          <p className="text-sm text-gray-600 line-clamp-2">
            {exercise.instructions.substring(0, 80)}...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{exercise.name}</CardTitle>
            
            <div className="flex items-center gap-3 mb-3">
              {showCategory && (
                <div className="flex items-center gap-1">
                  <span className="text-lg">{categoryInfo.emoji}</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColorClass(exercise.category)}`}>
                    {categoryInfo.name}
                  </span>
                </div>
              )}
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColorClass(exercise.difficulty_level)}`}>
                Level {exercise.difficulty_level} - {difficultyInfo?.label || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <CardDescription className="text-base">
          {difficultyInfo?.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Instructions Preview */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Instructions:</h4>
            <p className="text-gray-600 line-clamp-3">
              {exercise.instructions}
            </p>
          </div>

          {/* Muscles Targeted */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Primary Muscles:</h4>
            <div className="flex flex-wrap gap-1">
              {categoryInfo.muscles.map(muscle => (
                <span key={muscle} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleViewDetails}
              className="flex-1"
            >
              View Details
            </Button>
            <Button 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Add to workout functionality
                console.log('Add to workout:', exercise.name)
              }}
            >
              Add to Workout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}