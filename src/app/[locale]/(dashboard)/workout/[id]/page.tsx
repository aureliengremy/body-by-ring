'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Check,
  X,
  Clock,
  Target,
  Activity,
  MessageSquare,
  Save,
  ArrowLeft,
  Timer
} from 'lucide-react'
import { WorkoutTimer } from '@/components/workout/WorkoutTimer'

interface WorkoutSession {
  id: string
  week_number: number
  session_type: string
  is_deload: boolean
  started_at?: string
  notes?: string
  program: {
    name: string
    phase: number
  }
}

interface ExerciseSet {
  id: string
  exercise: {
    id: string
    name: string
    category: string
    instructions: string
    difficulty_level: number
  }
  set_number: number
  target_reps_min: number
  target_reps_max: number
  actual_reps?: number
  rpe?: number
  tempo: string
  notes?: string
  completed_at?: string
}

interface ExerciseGroup {
  exercise: ExerciseSet['exercise']
  sets: ExerciseSet[]
}

export default function ActiveWorkoutPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string
  
  const [workout, setWorkout] = useState<WorkoutSession | null>(null)
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false)
  const [restTimer, setRestTimer] = useState<number>(0)
  const [showTimer, setShowTimer] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState('')

  useEffect(() => {
    async function loadWorkoutData() {
      if (!user || !workoutId) return

    try {
      setLoading(true)

      // Load workout with program and sets
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          *,
          programs (
            name,
            phase
          ),
          sets (
            *,
            exercises (
              id,
              name,
              category,
              instructions,
              difficulty_level
            )
          )
        `)
        .eq('id', workoutId)
        .single()

      if (workoutError) throw workoutError
      if (!workoutData) throw new Error('Workout not found')

      // Check if user owns this workout
      const { data: programData } = await supabase
        .from('programs')
        .select('user_id')
        .eq('id', workoutData.program_id)
        .single()

      if (programData?.user_id !== user?.id) {
        throw new Error('Unauthorized access to workout')
      }

      setWorkout({
        id: workoutData.id,
        week_number: workoutData.week_number,
        session_type: workoutData.session_type,
        is_deload: workoutData.is_deload,
        started_at: workoutData.started_at,
        notes: workoutData.notes,
        program: workoutData.programs
      })

      setWorkoutNotes(workoutData.notes || '')
      setIsWorkoutStarted(!!workoutData.started_at)

      // Group sets by exercise
      const groups: ExerciseGroup[] = []
      const setsWithExercises = workoutData.sets.map((set: { exercises: unknown; [key: string]: unknown }) => ({
        ...set,
        exercise: set.exercises
      }))

      setsWithExercises.forEach((set: ExerciseSet) => {
        let group = groups.find(g => g.exercise.id === set.exercise.id)
        if (!group) {
          group = {
            exercise: set.exercise,
            sets: []
          }
          groups.push(group)
        }
        group.sets.push(set)
      })

      // Sort sets within each group by set number
      groups.forEach(group => {
        group.sets.sort((a, b) => a.set_number - b.set_number)
      })

      setExerciseGroups(groups)

      // Find current position if workout is in progress
      if (workoutData.started_at) {
        findCurrentPosition(groups)
      }

      } catch (err) {
        console.error('Error loading workout:', err)
        setError(err instanceof Error ? err.message : 'Failed to load workout')
      } finally {
        setLoading(false)
      }
    }

    loadWorkoutData()
  }, [user, workoutId])

  function findCurrentPosition(groups: ExerciseGroup[]) {
    for (let exerciseIndex = 0; exerciseIndex < groups.length; exerciseIndex++) {
      const sets = groups[exerciseIndex].sets
      for (let setIndex = 0; setIndex < sets.length; setIndex++) {
        if (!sets[setIndex].completed_at) {
          setCurrentExerciseIndex(exerciseIndex)
          setCurrentSetIndex(setIndex)
          return
        }
      }
    }
    // All sets completed
    setCurrentExerciseIndex(groups.length - 1)
    setCurrentSetIndex(groups[groups.length - 1]?.sets.length - 1 || 0)
  }

  async function startWorkout() {
    if (!workout) return

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ started_at: new Date().toISOString() })
        .eq('id', workout.id)

      if (error) throw error

      setIsWorkoutStarted(true)
      setWorkout(prev => prev ? { ...prev, started_at: new Date().toISOString() } : null)

    } catch (err) {
      console.error('Error starting workout:', err)
      setError('Failed to start workout')
    }
  }

  async function completeSet(setId: string, actualReps: number, rpe: number, notes?: string) {
    try {
      const { error } = await supabase
        .from('sets')
        .update({
          actual_reps: actualReps,
          rpe: rpe,
          notes: notes || null,
          completed_at: new Date().toISOString()
        })
        .eq('id', setId)

      if (error) throw error

      // Update local state
      setExerciseGroups(prev => prev.map(group => ({
        ...group,
        sets: group.sets.map(set => 
          set.id === setId 
            ? { ...set, actual_reps: actualReps, rpe, notes, completed_at: new Date().toISOString() }
            : set
        )
      })))

      // Move to next set
      moveToNextSet()
      
      // Start rest timer if not the last set
      if (!isLastSet()) {
        const currentSet = getCurrentSet()
        const restTime = getRestTimeForExercise(currentSet?.exercise.category || 'push')
        setRestTimer(restTime)
        setShowTimer(true)
      }

    } catch (err) {
      console.error('Error completing set:', err)
      setError('Failed to complete set')
    }
  }

  function moveToNextSet() {
    if (currentSetIndex < exerciseGroups[currentExerciseIndex]?.sets.length - 1) {
      setCurrentSetIndex(prev => prev + 1)
    } else if (currentExerciseIndex < exerciseGroups.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setCurrentSetIndex(0)
    }
  }

  function getCurrentSet(): ExerciseSet | null {
    return exerciseGroups[currentExerciseIndex]?.sets[currentSetIndex] || null
  }

  function isLastSet(): boolean {
    return currentExerciseIndex === exerciseGroups.length - 1 && 
           currentSetIndex === (exerciseGroups[currentExerciseIndex]?.sets.length - 1 || 0)
  }

  function getRestTimeForExercise(category: string): number {
    // Rest times in seconds based on exercise category
    const restTimes = {
      push: 120,  // 2 minutes for push exercises
      pull: 150,  // 2.5 minutes for pull exercises
      legs: 120,  // 2 minutes for legs
      core: 90    // 1.5 minutes for core
    }
    return restTimes[category as keyof typeof restTimes] || 120
  }

  function calculateWorkoutProgress(): number {
    const totalSets = exerciseGroups.reduce((total, group) => total + group.sets.length, 0)
    const completedSets = exerciseGroups.reduce((total, group) => 
      total + group.sets.filter(set => set.completed_at).length, 0)
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  }

  async function saveWorkoutNotes() {
    if (!workout) return

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ notes: workoutNotes })
        .eq('id', workout.id)

      if (error) throw error

      setWorkout(prev => prev ? { ...prev, notes: workoutNotes } : null)

    } catch (err) {
      console.error('Error saving notes:', err)
    }
  }

  async function completeWorkout() {
    if (!workout) return

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          completed_at: new Date().toISOString(),
          notes: workoutNotes
        })
        .eq('id', workout.id)

      if (error) throw error

      // Redirect to workout summary or programs page
      router.push(`/workout/${workout.id}/summary`)

    } catch (err) {
      console.error('Error completing workout:', err)
      setError('Failed to complete workout')
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
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Workout</h2>
            <p className="text-gray-600 mb-4">{error || 'Workout not found'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSet = getCurrentSet()
  const progress = calculateWorkoutProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rest Timer Overlay */}
      {showTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <Timer className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-4">Rest Period</h3>
              <WorkoutTimer
                restTimeSeconds={restTimer}
                onTimerComplete={() => setShowTimer(false)}
                autoStart={true}
              />
              <Button 
                onClick={() => setShowTimer(false)}
                variant="outline"
                className="mt-4"
              >
                Skip Rest
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{getSessionTypeLabel(workout.session_type)}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{workout.program.name}</span>
              <span>•</span>
              <span>Week {workout.week_number}</span>
              {workout.is_deload && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">Deload</Badge>
                </>
              )}
            </div>
          </div>
          {!isWorkoutStarted ? (
            <Button onClick={startWorkout} size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          ) : (
            <Button onClick={completeWorkout} size="lg">
              <Check className="w-4 h-4 mr-2" />
              Complete Workout
            </Button>
          )}
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Workout Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                {exerciseGroups.reduce((total, group) => 
                  total + group.sets.filter(set => set.completed_at).length, 0)} completed
              </span>
              <span>
                {exerciseGroups.reduce((total, group) => total + group.sets.length, 0)} total sets
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Exercise */}
          <div className="lg:col-span-2">
            {currentSet && (
              <SetLogger
                set={currentSet}
                isActive={true}
                onComplete={completeSet}
              />
            )}

            {/* Exercise List */}
            <div className="mt-6 space-y-4">
              {exerciseGroups.map((group, exerciseIndex) => (
                <Card 
                  key={group.exercise.id}
                  className={exerciseIndex === currentExerciseIndex ? 'ring-2 ring-blue-500' : ''}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {group.exercise.name}
                      <Badge variant="outline" className="text-xs">
                        {group.exercise.category}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{group.exercise.instructions}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {group.sets.map((set, setIndex) => (
                      <div 
                        key={set.id}
                        className={`p-3 rounded border ${
                          exerciseIndex === currentExerciseIndex && setIndex === currentSetIndex
                            ? 'bg-blue-50 border-blue-200'
                            : set.completed_at
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">Set {set.set_number}</span>
                            <span className="text-sm text-gray-600">
                              {set.target_reps_min}-{set.target_reps_max} reps
                            </span>
                            <span className="text-xs text-gray-500">({set.tempo})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {set.completed_at && (
                              <>
                                <span className="text-sm font-medium">{set.actual_reps} reps</span>
                                <span className="text-xs text-gray-500">RPE {set.rpe}</span>
                                <Check className="w-4 h-4 text-green-600" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workout Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How are you feeling? Any modifications or observations..."
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  onClick={saveWorkoutNotes}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Workout Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Exercises:</span>
                  <span>{exerciseGroups.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Sets:</span>
                  <span>{exerciseGroups.reduce((total, group) => total + group.sets.length, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed:</span>
                  <span>{exerciseGroups.reduce((total, group) => 
                    total + group.sets.filter(set => set.completed_at).length, 0)}</span>
                </div>
                {isWorkoutStarted && workout.started_at && (
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>
                      {Math.round((Date.now() - new Date(workout.started_at).getTime()) / 1000 / 60)} min
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Set Logger Component
interface SetLoggerProps {
  set: ExerciseSet
  isActive: boolean
  onComplete: (setId: string, actualReps: number, rpe: number, notes?: string) => void
}

function SetLogger({ set, isActive, onComplete }: SetLoggerProps) {
  const [actualReps, setActualReps] = useState<string>('')
  const [rpe, setRpe] = useState<string>('')
  const [notes, setNotes] = useState('')

  const handleComplete = () => {
    if (!actualReps || !rpe) return

    onComplete(set.id, parseInt(actualReps), parseInt(rpe), notes || undefined)
    
    // Reset form
    setActualReps('')
    setRpe('')
    setNotes('')
  }

  if (!isActive) return null

  return (
    <Card className="ring-2 ring-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl">{set.exercise.name}</div>
            <div className="text-sm font-normal text-gray-600">
              Set {set.set_number} of {set.exercise.name}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Target: {set.target_reps_min}-{set.target_reps_max} reps</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Tempo: {set.tempo}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Actual Reps</label>
            <Input
              type="number"
              placeholder={`${set.target_reps_min}-${set.target_reps_max}`}
              value={actualReps}
              onChange={(e) => setActualReps(e.target.value)}
              className="text-center text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RPE (6-10)</label>
            <Input
              type="number"
              min="6"
              max="10"
              placeholder="8"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="text-center text-lg font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Set Notes (optional)</label>
          <Input
            placeholder="Felt good, form was solid..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          onClick={handleComplete}
          disabled={!actualReps || !rpe || parseInt(rpe) < 6 || parseInt(rpe) > 10}
          className="w-full"
          size="lg"
        >
          <Check className="w-4 h-4 mr-2" />
          Complete Set
        </Button>

        {/* RPE Reference */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="font-medium mb-1">RPE Reference:</div>
          <div className="grid grid-cols-1 gap-0.5">
            <div>6-7: Easy, could do many more reps</div>
            <div>8: Hard, could do 2-3 more reps</div>
            <div>9: Very hard, could do 1 more rep</div>
            <div>10: Maximum effort, couldn&apos;t do another rep</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}