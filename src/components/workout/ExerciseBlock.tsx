'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SetLogger } from './SetLogger'
import { WorkoutTimer } from './WorkoutTimer'
import { useTranslations } from '@/lib/i18n'
import type { Exercise } from '@/types/exercise'
import { CATEGORY_INFO, getDifficultyColorClass } from '@/types/exercise'

interface SetData {
  set_number: number
  target_reps_min?: number
  target_reps_max?: number
  actual_reps?: number
  rpe?: number
  tempo?: string
  notes?: string
  completed: boolean
}

interface ExerciseBlockProps {
  exercise: Exercise
  sets: SetData[]
  onSetsUpdate: (sets: SetData[]) => void
  onExerciseComplete: () => void
  isActive: boolean
  showInstructions?: boolean
}

export function ExerciseBlock({
  exercise,
  sets,
  onSetsUpdate,
  onExerciseComplete,
  isActive,
  showInstructions = true
}: ExerciseBlockProps) {
  const t = useTranslations('exerciseBlock')
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [showTimer, setShowTimer] = useState(false)
  const [showFullInstructions, setShowFullInstructions] = useState(false)

  const categoryInfo = CATEGORY_INFO[exercise.category]
  const completedSets = sets.filter(set => set.completed).length
  const isExerciseComplete = completedSets === sets.length

  const handleSetUpdate = (setIndex: number, updatedSet: SetData) => {
    const newSets = [...sets]
    newSets[setIndex] = updatedSet
    onSetsUpdate(newSets)
  }

  const handleSetComplete = (setIndex: number) => {
    const newSets = [...sets]
    newSets[setIndex].completed = true
    onSetsUpdate(newSets)

    // Move to next set or show timer
    if (setIndex < sets.length - 1) {
      setShowTimer(true)
      setCurrentSetIndex(setIndex + 1)
    } else {
      // All sets complete
      onExerciseComplete()
    }
  }

  const handleTimerComplete = () => {
    setShowTimer(false)
  }

  const handleSkipRest = () => {
    setShowTimer(false)
  }

  return (
    <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''} ${isExerciseComplete ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <span className="text-xl">{categoryInfo.emoji}</span>
              {exercise.name}
              {isExerciseComplete && (
                <span className="text-green-600 text-sm">✓ {t('complete')}</span>
              )}
            </CardTitle>

            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-1 rounded text-sm font-medium border ${getDifficultyColorClass(exercise.difficulty_level)}`}>
                {t('level')} {exercise.difficulty_level}
              </span>
              <span className="text-sm text-gray-600">
                {completedSets} {t('setsComplete')} {sets.length}
              </span>
            </div>
          </div>
        </div>

        {showInstructions && (
          <CardDescription className="mt-3">
            <div className={showFullInstructions ? '' : 'line-clamp-2'}>
              {exercise.instructions}
            </div>
            {exercise.instructions.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-600"
                onClick={() => setShowFullInstructions(!showFullInstructions)}
              >
                {showFullInstructions ? t('showLess') : t('showMore')}
              </Button>
            )}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rest Timer */}
        {showTimer && isActive && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">{t('restBetweenSets')}</h4>
            <WorkoutTimer
              restTimeSeconds={120} // 2 minutes default
              onTimerComplete={handleTimerComplete}
              autoStart={true}
            />
            <div className="text-center mt-3">
              <Button onClick={handleSkipRest} variant="outline" size="sm">
                {t('skipRestContinue')}
              </Button>
            </div>
          </div>
        )}

        {/* Sets */}
        <div className="space-y-3">
          {sets.map((set, index) => (
            <SetLogger
              key={set.set_number}
              exercise={exercise}
              setData={set}
              onUpdate={(updatedSet) => handleSetUpdate(index, updatedSet)}
              onComplete={() => handleSetComplete(index)}
              isActive={isActive && index === currentSetIndex && !showTimer}
            />
          ))}
        </div>

        {/* Exercise Summary */}
        {isExerciseComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">{t('exerciseComplete')}</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>{t('totalSets')} {completedSets}</div>
              <div>{t('totalReps')} {sets.reduce((total, set) => total + (set.actual_reps || 0), 0)}</div>
              <div>{t('averageRpe')} {
                Math.round(sets.reduce((total, set) => total + (set.rpe || 0), 0) / sets.length * 10) / 10
              }/10</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}