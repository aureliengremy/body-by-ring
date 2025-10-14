'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Target,
  Activity,
  Clock,
  TrendingUp,
  PlayCircle,
  CheckCircle2
} from 'lucide-react'

interface Program {
  id: string
  name: string
  phase: number
  cycle_number: number
  status: string
  started_at: string
  created_at: string
}

interface Workout {
  id: string
  week_number: number
  session_type: string
  is_deload: boolean
  completed_at?: string
  sets: Set[]
}

interface Set {
  id: string
  exercise: {
    name: string
    category: string
    difficulty_level: number
  }
  set_number: number
  target_reps_min: number
  target_reps_max: number
  actual_reps?: number
  tempo: string
  completed_at?: string
}

export default function ProgramDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const programId = params.id as string
  
  const [program, setProgram] = useState<Program | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProgramData() {
      if (!user || !programId) return

      try {
        setLoading(true)

        // Load program details
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .eq('user_id', user.id)
          .single()

        if (programError) throw programError
        setProgram(programData)

        // Load workouts with sets and exercises
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select(`
            *,
            sets (
              *,
              exercises (
                name,
                category,
                difficulty_level
              )
            )
          `)
          .eq('program_id', programId)
          .order('week_number', { ascending: true })
          .order('session_type', { ascending: true })

        if (workoutError) throw workoutError

        // Group sets by workout
        const processedWorkouts = workoutData.map(workout => ({
          ...workout,
          sets: workout.sets.map((set: { exercises: unknown; [key: string]: unknown }) => ({
            ...set,
            exercise: set.exercises
          }))
        }))

        setWorkouts(processedWorkouts)

      } catch (err) {
        console.error('Error loading program:', err)
        setError(err instanceof Error ? err.message : 'Failed to load program')
      } finally {
        setLoading(false)
      }
    }

    loadProgramData()
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
      1: 'Foundation Phase',
      2: 'Development Phase',
      3: 'Mastery Phase'
    }
    return phases[phase] || `Phase ${phase}`
  }

  const calculateWeekProgress = (weekNumber: number) => {
    const weekWorkouts = workouts.filter(w => w.week_number === weekNumber)
    const completedWorkouts = weekWorkouts.filter(w => w.completed_at)
    return weekWorkouts.length > 0 ? (completedWorkouts.length / weekWorkouts.length) * 100 : 0
  }

  const calculateWorkoutProgress = (workout: Workout) => {
    const totalSets = workout.sets.length
    const completedSets = workout.sets.filter(s => s.completed_at).length
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Program not found'}</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group workouts by week
  const workoutsByWeek = workouts.reduce((acc, workout) => {
    if (!acc[workout.week_number]) {
      acc[workout.week_number] = []
    }
    acc[workout.week_number].push(workout)
    return acc
  }, {} as Record<number, Workout[]>)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Program Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                <Target className="w-3 h-3 mr-1" />
                {getPhaseLabel(program.phase)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Activity className="w-3 h-3 mr-1" />
                Cycle {program.cycle_number}
              </Badge>
              <Badge 
                variant={program.status === 'active' ? 'default' : 'secondary'}
                className="text-sm"
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  program.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                {program.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button>
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold">5 Weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Workouts</p>
                <p className="text-lg font-semibold">{workouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-semibold">
                  {workouts.filter(w => w.completed_at).length} / {workouts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold">
                  {Math.round((workouts.filter(w => w.completed_at).length / workouts.length) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Weekly Overview</TabsTrigger>
          <TabsTrigger value="details">Workout Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(weekNumber => {
              const weekWorkouts = workoutsByWeek[weekNumber] || []
              const isDeload = weekNumber === 5
              const progress = calculateWeekProgress(weekNumber)
              
              return (
                <Card key={weekNumber} className={`${isDeload ? 'border-orange-200 bg-orange-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Week {weekNumber}
                      {isDeload && (
                        <Badge variant="outline" className="text-xs bg-orange-100">
                          Deload
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {weekWorkouts.length} sessions
                      </p>
                      {weekWorkouts.map(workout => (
                        <div key={workout.id} className="text-xs">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            workout.completed_at ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          {getSessionTypeLabel(workout.session_type)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {Object.entries(workoutsByWeek).map(([week, weekWorkouts]) => (
            <div key={week}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Week {week}
                {parseInt(week) === 5 && (
                  <Badge variant="outline" className="bg-orange-100">
                    <Clock className="w-3 h-3 mr-1" />
                    Deload Week
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weekWorkouts.map(workout => (
                  <Card key={workout.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {getSessionTypeLabel(workout.session_type)}
                        </CardTitle>
                        <Badge variant={workout.completed_at ? 'default' : 'secondary'}>
                          {workout.completed_at ? 'Complete' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workout.sets.length > 0 ? (
                          <>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Exercises</span>
                              <span>{new Set(workout.sets.map(s => s.exercise.name)).size}</span>
                            </div>
                            <div className="space-y-1">
                              {Array.from(new Set(workout.sets.map(s => s.exercise.name))).map(exerciseName => {
                                const exerciseSets = workout.sets.filter(s => s.exercise.name === exerciseName)
                                return (
                                  <div key={exerciseName} className="text-sm">
                                    <div className="font-medium">{exerciseName}</div>
                                    <div className="text-gray-600 text-xs">
                                      {exerciseSets.length} sets × {exerciseSets[0]?.target_reps_min}-{exerciseSets[0]?.target_reps_max} reps
                                      <span className="ml-2">({exerciseSets[0]?.tempo})</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{Math.round(calculateWorkoutProgress(workout))}%</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">No exercises assigned</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}