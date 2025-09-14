'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle2,
  Trophy,
  Target,
  Clock,
  Activity,
  TrendingUp,
  MessageSquare,
  ArrowLeft,
  Home,
  Calendar,
  Star,
  Save
} from 'lucide-react'

interface WorkoutSummary {
  id: string
  week_number: number
  session_type: string
  is_deload: boolean
  started_at: string
  completed_at: string
  notes?: string
  program: {
    name: string
    phase: number
  }
  sets: Array<{
    id: string
    set_number: number
    target_reps_min: number
    target_reps_max: number
    actual_reps: number
    rpe: number
    tempo: string
    notes?: string
    exercise: {
      name: string
      category: string
      difficulty_level: number
    }
  }>
}

interface ExerciseStats {
  name: string
  category: string
  totalSets: number
  totalReps: number
  averageRpe: number
  bestSet: {
    reps: number
    rpe: number
  }
}

export default function WorkoutSummaryPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string
  
  const [workout, setWorkout] = useState<WorkoutSummary | null>(null)
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [showAddNotes, setShowAddNotes] = useState(false)

  useEffect(() => {
    if (user && workoutId) {
      loadWorkoutSummary()
    }
  }, [user, workoutId])

  async function loadWorkoutSummary() {
    try {
      setLoading(true)

      // Load completed workout with all data
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          *,
          programs (
            name,
            phase,
            user_id
          ),
          sets (
            *,
            exercises (
              name,
              category,
              difficulty_level
            )
          )
        `)
        .eq('id', workoutId)
        .single()

      if (workoutError) throw workoutError
      if (!workoutData) throw new Error('Workout not found')

      // Check authorization
      if (workoutData.programs.user_id !== user?.id) {
        throw new Error('Unauthorized access')
      }

      // Process workout data
      const processedWorkout: WorkoutSummary = {
        id: workoutData.id,
        week_number: workoutData.week_number,
        session_type: workoutData.session_type,
        is_deload: workoutData.is_deload,
        started_at: workoutData.started_at,
        completed_at: workoutData.completed_at,
        notes: workoutData.notes,
        program: workoutData.programs,
        sets: workoutData.sets.map((set: any) => ({
          ...set,
          exercise: set.exercises
        }))
      }

      setWorkout(processedWorkout)
      setReflectionNotes(workoutData.notes || '')

      // Calculate exercise statistics
      const stats = calculateExerciseStats(processedWorkout.sets)
      setExerciseStats(stats)

    } catch (err) {
      console.error('Error loading workout summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workout summary')
    } finally {
      setLoading(false)
    }
  }

  function calculateExerciseStats(sets: WorkoutSummary['sets']): ExerciseStats[] {
    const exerciseMap = new Map<string, ExerciseStats>()

    sets.forEach(set => {
      const exerciseName = set.exercise.name
      
      if (!exerciseMap.has(exerciseName)) {
        exerciseMap.set(exerciseName, {
          name: exerciseName,
          category: set.exercise.category,
          totalSets: 0,
          totalReps: 0,
          averageRpe: 0,
          bestSet: { reps: 0, rpe: 10 }
        })
      }

      const stats = exerciseMap.get(exerciseName)!
      stats.totalSets++
      stats.totalReps += set.actual_reps || 0

      // Update best set (highest reps with lowest RPE preference)
      if (set.actual_reps > stats.bestSet.reps || 
          (set.actual_reps === stats.bestSet.reps && set.rpe < stats.bestSet.rpe)) {
        stats.bestSet = {
          reps: set.actual_reps,
          rpe: set.rpe
        }
      }
    })

    // Calculate average RPE for each exercise
    exerciseMap.forEach((stats, exerciseName) => {
      const exerciseSets = sets.filter(s => s.exercise.name === exerciseName)
      const totalRpe = exerciseSets.reduce((sum, s) => sum + s.rpe, 0)
      stats.averageRpe = totalRpe / exerciseSets.length
    })

    return Array.from(exerciseMap.values())
  }

  async function saveReflectionNotes() {
    if (!workout) return

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ notes: reflectionNotes })
        .eq('id', workout.id)

      if (error) throw error

      setWorkout(prev => prev ? { ...prev, notes: reflectionNotes } : null)
      setShowAddNotes(false)

    } catch (err) {
      console.error('Error saving reflection notes:', err)
    }
  }

  const getSessionTypeLabel = (sessionType: string) => {
    const labels: Record<string, string> = {
      'push_1': 'Push Day 1',
      'pull_1': 'Pull Day 1',
      'push_2': 'Push Day 2',
      'pull_2': 'Pull Day 2'
    }
    return labels[sessionType] || sessionType
  }

  const getPhaseLabel = (phase: number) => {
    const phases: Record<number, string> = {
      1: 'Foundation',
      2: 'Development', 
      3: 'Mastery'
    }
    return phases[phase] || `Phase ${phase}`
  }

  const calculateDuration = () => {
    if (!workout?.started_at || !workout?.completed_at) return 0
    return Math.round((new Date(workout.completed_at).getTime() - new Date(workout.started_at).getTime()) / 1000 / 60)
  }

  const calculateTotalVolume = () => {
    return workout?.sets.reduce((total, set) => total + (set.actual_reps || 0), 0) || 0
  }

  const calculateAverageRpe = () => {
    if (!workout?.sets.length) return 0
    const totalRpe = workout.sets.reduce((sum, set) => sum + set.rpe, 0)
    return (totalRpe / workout.sets.length).toFixed(1)
  }

  const getPerformanceRating = () => {
    const avgRpe = parseFloat(calculateAverageRpe())
    if (avgRpe <= 7) return { rating: 'Excellent', color: 'text-green-600', icon: '🔥' }
    if (avgRpe <= 8) return { rating: 'Good', color: 'text-blue-600', icon: '💪' }
    if (avgRpe <= 8.5) return { rating: 'Solid', color: 'text-yellow-600', icon: '👍' }
    return { rating: 'Tough', color: 'text-red-600', icon: '💯' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to Load Summary</h2>
            <p className="text-gray-600 mb-4">{error || 'Workout summary not found'}</p>
            <Button onClick={() => router.push('/workouts')}>
              View All Workouts
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const performance = getPerformanceRating()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Complete!</h1>
          <p className="text-xl text-gray-600">
            {getSessionTypeLabel(workout.session_type)} • Week {workout.week_number}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge variant="outline">{getPhaseLabel(workout.program.phase)}</Badge>
            {workout.is_deload && (
              <Badge variant="outline" className="bg-orange-100 border-orange-300">
                Deload Week
              </Badge>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{calculateDuration()}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{calculateTotalVolume()}</div>
              <div className="text-sm text-gray-600">Total Reps</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{calculateAverageRpe()}</div>
              <div className="text-sm text-gray-600">Avg RPE</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className={`w-6 h-6 mx-auto mb-2 ${performance.color}`} />
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <span>{performance.icon}</span>
                <span>{performance.rating}</span>
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Exercise Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exerciseStats.map((exercise, index) => (
                <div key={exercise.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exercise.totalSets} sets • {exercise.totalReps} total reps
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {exercise.bestSet.reps} reps
                    </div>
                    <div className="text-sm text-gray-600">
                      Best set (RPE {exercise.bestSet.rpe})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Notes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Session Reflection
              </div>
              {!showAddNotes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddNotes(true)}
                >
                  {workout.notes ? 'Edit Notes' : 'Add Notes'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddNotes ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="How did the workout feel? Any observations about your performance, form, or energy levels..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="min-h-32"
                />
                <div className="flex gap-2">
                  <Button onClick={saveReflectionNotes}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddNotes(false)
                      setReflectionNotes(workout.notes || '')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {workout.notes ? (
                  <p className="text-gray-700 leading-relaxed">{workout.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No reflection notes added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Sets Log */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complete Sets Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exerciseStats.map((exercise) => {
                const exerciseSets = workout.sets.filter(s => s.exercise.name === exercise.name)
                
                return (
                  <div key={exercise.name}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      {exercise.name}
                      <Badge variant="outline" className="text-xs">
                        Avg RPE: {exercise.averageRpe.toFixed(1)}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {exerciseSets.map((set) => (
                        <div
                          key={set.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">Set {set.set_number}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                set.rpe <= 7 ? 'bg-green-100 border-green-300' :
                                set.rpe <= 8 ? 'bg-blue-100 border-blue-300' :
                                set.rpe <= 9 ? 'bg-yellow-100 border-yellow-300' :
                                'bg-red-100 border-red-300'
                              }`}
                            >
                              RPE {set.rpe}
                            </Badge>
                          </div>
                          <div className="text-lg font-semibold">
                            {set.actual_reps} reps
                          </div>
                          <div className="text-xs text-gray-600">
                            Target: {set.target_reps_min}-{set.target_reps_max} • {set.tempo}
                          </div>
                          {set.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              "{set.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/workouts">
              <Calendar className="w-4 h-4 mr-2" />
              View All Workouts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/workout/start">
              <Activity className="w-4 h-4 mr-2" />
              Start Next Workout
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* DAY 5 Achievement */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  🎉 DAY 5 Feature: Complete Workout Logging
                </h3>
                <p className="text-sm text-gray-600">
                  Your workout has been logged with RPE tracking, performance analysis, 
                  and detailed session notes for optimal progress tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}