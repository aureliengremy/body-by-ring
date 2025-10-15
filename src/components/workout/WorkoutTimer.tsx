'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n'

interface WorkoutTimerProps {
  restTimeSeconds?: number
  onTimerComplete?: () => void
  autoStart?: boolean
}

export function WorkoutTimer({
  restTimeSeconds = 120,
  onTimerComplete,
  autoStart = false
}: WorkoutTimerProps) {
  const t = useTranslations('workoutTimer')
  const [timeLeft, setTimeLeft] = useState(restTimeSeconds)
  const [isActive, setIsActive] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false)
            setIsComplete(true)
            onTimerComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, onTimerComplete])

  const handleStart = () => {
    setIsActive(true)
    setIsComplete(false)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeLeft(restTimeSeconds)
    setIsComplete(false)
  }

  const handleSkip = () => {
    setIsActive(false)
    setTimeLeft(0)
    setIsComplete(true)
    onTimerComplete?.()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((restTimeSeconds - timeLeft) / restTimeSeconds) * 100

  return (
    <Card className={`${isComplete ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Timer Display */}
          <div>
            <div className={`text-4xl font-mono font-bold ${
              isComplete ? 'text-green-600' :
              timeLeft <= 10 ? 'text-red-600' :
              timeLeft <= 30 ? 'text-orange-500' :
              'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isComplete ? t('restComplete') : t('restTimeRemaining')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Timer Controls */}
          <div className="flex gap-2 justify-center">
            {!isActive && !isComplete && (
              <Button onClick={handleStart} size="sm">
                {t('startRest')}
              </Button>
            )}

            {isActive && (
              <Button onClick={handlePause} variant="outline" size="sm">
                {t('pause')}
              </Button>
            )}

            <Button onClick={handleReset} variant="outline" size="sm">
              {t('reset')}
            </Button>

            {!isComplete && (
              <Button onClick={handleSkip} variant="ghost" size="sm">
                {t('skipRest')}
              </Button>
            )}
          </div>

          {/* Quick Timer Buttons */}
          {!isActive && (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setTimeLeft(60)
                  setIsComplete(false)
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                1 {t('minutes')}
              </Button>
              <Button
                onClick={() => {
                  setTimeLeft(90)
                  setIsComplete(false)
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                1.5 {t('minutes')}
              </Button>
              <Button
                onClick={() => {
                  setTimeLeft(120)
                  setIsComplete(false)
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                2 {t('minutes')}
              </Button>
              <Button
                onClick={() => {
                  setTimeLeft(180)
                  setIsComplete(false)
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                3 {t('minutes')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

