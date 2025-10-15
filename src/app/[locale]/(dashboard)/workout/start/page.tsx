'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Target,
  Activity,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface Workout {
  id: string
  week_number: number
  session_type: string
  is_deload: boolean
  started_at?: string
  completed_at?: string
  program: {
    id: string
    name: string
    phase: number
  }
  sets: Array<{
    id: string
    exercise: {
      name: string
      category: string
    }
  }>
}

export default function StartWorkoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('program')
  
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAvailableWorkouts = async () => {
    if (!user) return

    try {
      setLoading(true)

    let query = supabase
      .from('workouts')
      .select(`
        *,
        programs!inner (
          id,
          name,
          phase,
          user_id
        ),
        sets (
          id,
          exercises (
            name,
            category
          )
        )
      `)
      .eq('programs.user_id', user?.id)
      .order('week_number', { ascending: true })
      .order('session_type', { ascending: true })

    // Filter by program if specified
    if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data: workoutData, error: workoutError } = await query

    if (workoutError) throw workoutError

    // Process workouts
    const processedWorkouts = workoutData?.map(workout => ({
      ...workout,
      program: workout.programs,
      sets: workout.sets?.map((set: { id: string; exercises: unknown }) => ({
        id: set.id,
        exercise: set.exercises
      })) || []
    })) || []

    setWorkouts(processedWorkouts)

    } catch (err) {
      console.error('Error loading workouts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailableWorkouts()
  }, [user, programId])

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

  const getWorkoutStatus = (workout: Workout) => {
    if (workout.completed_at) return 'completed'
    if (workout.started_at) return 'in_progress'
    return 'not_started'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Ready to Start'
    }
  }

  const getUniqueExercises = (sets: Workout['sets']) => {
    const uniqueExercises = new Map()
    sets.forEach(set => {
      if (!uniqueExercises.has(set.exercise.name)) {
        uniqueExercises.set(set.exercise.name, set.exercise)
      }
    })
    return Array.from(uniqueExercises.values())
  }

  const getNextWorkout = () => {
    return workouts.find(w => getWorkoutStatus(w) === 'not_started')
  }

  const getInProgressWorkout = () => {
    return workouts.find(w => getWorkoutStatus(w) === 'in_progress')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const nextWorkout = getNextWorkout()
  const inProgressWorkout = getInProgressWorkout()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Start Workout</h1>
            <p className="text-gray-600">Choose your next training session</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
              <Button onClick={loadAvailableWorkouts} variant="outline" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Continue In Progress Workout */}
        {inProgressWorkout && (
          <Card className="mb-6 ring-2 ring-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Continue Your Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {getSessionTypeLabel(inProgressWorkout.session_type)}
                  </h3>
                  <p className="text-gray-600">
                    {inProgressWorkout.program.name} • Week {inProgressWorkout.week_number}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Started {new Date(inProgressWorkout.started_at!).toLocaleTimeString()}
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href={`/workout/${inProgressWorkout.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Recommended Workout */}
        {nextWorkout && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Next Recommended Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {getSessionTypeLabel(nextWorkout.session_type)}
                  </h3>
                  <p className="text-gray-600">
                    {nextWorkout.program.name} • Week {nextWorkout.week_number}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {getPhaseLabel(nextWorkout.program.phase)}
                    </Badge>
                    {nextWorkout.is_deload && (
                      <Badge variant="outline" className="bg-orange-100 border-orange-300">
                        Deload Week
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getUniqueExercises(nextWorkout.sets).length} exercises • {nextWorkout.sets.length} sets
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href={`/workout/${nextWorkout.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Available Workouts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">All Workouts</h2>
          
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Workouts Available
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to create a training program first.
                </p>
                <Button asChild>
                  <Link href="/programs">View Programs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => {
                const status = getWorkoutStatus(workout)
                const uniqueExercises = getUniqueExercises(workout.sets)
                
                return (
                  <Card 
                    key={workout.id}
                    className={`group hover:shadow-md transition-all ${
                      status === 'in_progress' ? 'ring-1 ring-blue-500' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {getSessionTypeLabel(workout.session_type)}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                          <span className="text-xs text-gray-600">{getStatusLabel(status)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Week {workout.week_number}
                        {workout.is_deload && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Deload
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="w-3 h-3" />
                          <span>{uniqueExercises.length} exercises</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{workout.sets.length} total sets</span>
                        </div>
                      </div>

                      {/* Exercise Preview */}
                      <div className="text-xs text-gray-500">
                        {uniqueExercises.slice(0, 3).map(exercise => exercise.name).join(', ')}
                        {uniqueExercises.length > 3 && ` +${uniqueExercises.length - 3} more`}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t">
                        {status === 'completed' ? (
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/workout/${workout.id}/summary`}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              View Summary
                            </Link>
                          </Button>
                        ) : status === 'in_progress' ? (
                          <Button size="sm" className="w-full" asChild>
                            <Link href={`/workout/${workout.id}`}>
                              <Play className="w-3 h-3 mr-1" />
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" asChild>
                            <Link href={`/workout/${workout.id}`}>
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* DAY 5 Progress Badge */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  🏋️ DAY 5 In Progress: Active Workout Interface
                </h3>
                <p className="text-sm text-gray-600">
                  Real-time workout logging with RPE tracking, rest timers, and session notes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}