'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExerciseBlock } from '@/components/workout/ExerciseBlock'
import type { Exercise } from '@/types/exercise'

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

interface WorkoutExercise {
  exercise: Exercise
  sets: SetData[]
}

export default function WorkoutDemoPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load demo workout
  useEffect(() => {
    async function loadDemoWorkout() {
      try {
        // Get a few exercises for demo
        const { data: exercises, error } = await supabase
          .from('exercises')
          .select('*')
          .in('name', ['Push-ups', 'Pull-ups', 'Squats'])
          .order('difficulty_level', { ascending: true })

        if (error) throw error

        // Create workout with sets
        const workoutData: WorkoutExercise[] = exercises.map(exercise => ({
          exercise,
          sets: [
            {
              set_number: 1,
              target_reps_min: 8,
              target_reps_max: 12,
              completed: false
            },
            {
              set_number: 2,
              target_reps_min: 8,
              target_reps_max: 12,
              completed: false
            },
            {
              set_number: 3,
              target_reps_min: 6,
              target_reps_max: 10,
              completed: false
            }
          ]
        }))

        setWorkoutExercises(workoutData)
      } catch (err) {
        console.error('Error loading demo workout:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDemoWorkout()
    }
  }, [user])

  const handleExerciseComplete = (exerciseIndex: number) => {
    // Move to next exercise or complete workout
    if (exerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1)
    } else {
      setWorkoutCompleted(true)
    }
  }

  const handleSetsUpdate = (exerciseIndex: number, updatedSets: SetData[]) => {
    const newWorkoutExercises = [...workoutExercises]
    newWorkoutExercises[exerciseIndex].sets = updatedSets
    setWorkoutExercises(newWorkoutExercises)
  }

  const startWorkout = () => {
    setWorkoutStarted(true)
  }

  const resetWorkout = () => {
    setWorkoutStarted(false)
    setWorkoutCompleted(false)
    setCurrentExerciseIndex(0)
    
    // Reset all sets
    const resetWorkout = workoutExercises.map(we => ({
      ...we,
      sets: we.sets.map(set => ({
        ...set,
        actual_reps: undefined,
        rpe: undefined,
        notes: undefined,
        completed: false
      }))
    }))
    setWorkoutExercises(resetWorkout)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏋️ Workout Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Test the workout logging components
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                ← Dashboard
              </Button>
              
              {workoutStarted && (
                <Button 
                  variant="outline" 
                  onClick={resetWorkout}
                >
                  Reset Workout
                </Button>
              )}
            </div>
          </div>
        </div>

        {!workoutStarted ? (
          /* Pre-Workout Screen */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ready to Start Your Workout?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  This demo includes a sample workout with push-ups, pull-ups, and squats. 
                  Each exercise has 3 sets with target rep ranges.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Today's Exercises:</h4>
                  {workoutExercises.map((we, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{we.exercise.name}</span>
                      <span className="text-sm text-gray-600">
                        {we.sets.length} sets • Level {we.exercise.difficulty_level}
                      </span>
                    </div>
                  ))}
                </div>

                <Button onClick={startWorkout} className="w-full mt-6">
                  Start Workout 🚀
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : workoutCompleted ? (
          /* Post-Workout Screen */
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Workout Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">
                  Great job! You've completed all exercises in this demo workout.
                </p>

                {/* Workout Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-800">Workout Summary:</h4>
                  {workoutExercises.map((we, index) => {
                    const completedSets = we.sets.filter(s => s.completed).length
                    const totalReps = we.sets.reduce((total, set) => total + (set.actual_reps || 0), 0)
                    const avgRpe = Math.round(
                      we.sets.reduce((total, set) => total + (set.rpe || 0), 0) / 
                      we.sets.length * 10
                    ) / 10

                    return (
                      <div key={index} className="p-3 bg-white border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{we.exercise.name}</h5>
                            <div className="text-sm text-gray-600 mt-1">
                              {completedSets} sets • {totalReps} total reps • Avg RPE: {avgRpe || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={resetWorkout} className="flex-1">
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/exercises')}
                    className="flex-1"
                  >
                    Browse Exercises
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Workout */
          <div className="space-y-8">
            {/* Progress Indicator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Workout Progress</h3>
                    <p className="text-sm text-gray-600">
                      Exercise {currentExerciseIndex + 1} of {workoutExercises.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {Math.round(((currentExerciseIndex) / workoutExercises.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentExerciseIndex) / workoutExercises.length) * 100}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exercise Blocks */}
            {workoutExercises.map((workoutExercise, index) => (
              <ExerciseBlock
                key={index}
                exercise={workoutExercise.exercise}
                sets={workoutExercise.sets}
                onSetsUpdate={(sets) => handleSetsUpdate(index, sets)}
                onExerciseComplete={() => handleExerciseComplete(index)}
                isActive={index === currentExerciseIndex}
                showInstructions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}