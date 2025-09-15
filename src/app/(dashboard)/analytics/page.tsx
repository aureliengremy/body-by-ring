'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  Activity,
  BarChart3
} from 'lucide-react'
import { ProgressReports } from '@/components/analytics/ProgressReports'
import { ExerciseTracking } from '@/components/analytics/ExerciseTracking'
import { GoalTracking } from '@/components/analytics/GoalTracking'
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis'
import { AchievementSystem } from '@/components/analytics/AchievementSystem'
import { ExportTools } from '@/components/analytics/ExportTools'

interface WorkoutData {
  date: string
  volume: number
  averageRpe: number
  duration: number
  completedSets: number
}

interface ExerciseProgress {
  exercise: string
  currentBest: number
  previousBest: number
  improvement: number
  sessions: number
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    averageRpe: 0,
    streak: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth')
    return null
  }

  useEffect(() => {
    async function loadAnalyticsData() {
      if (!user) return

      try {
        // Load workout data for charts
        const { data: workouts } = await supabase
          .from('workouts')
          .select(`
            id,
            completed_at,
            notes,
            programs!inner(user_id),
            sets(actual_reps, rpe, completed_at)
          `)
          .eq('programs.user_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true })

        if (workouts) {
          // Process workout data for charts
          const processedData: WorkoutData[] = workouts.map(workout => {
            const sets = workout.sets || []
            const totalReps = sets.reduce((sum, set) => sum + (set.actual_reps || 0), 0)
            const avgRpe = sets.length > 0 
              ? sets.reduce((sum, set) => sum + (set.rpe || 0), 0) / sets.length 
              : 0
            
            return {
              date: new Date(workout.completed_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
              }),
              volume: totalReps,
              averageRpe: Math.round(avgRpe * 10) / 10,
              duration: 45, // Mock duration for now
              completedSets: sets.length
            }
          })

          setWorkoutData(processedData)

          // Calculate overall stats
          const totalWorkouts = workouts.length
          const totalVolume = processedData.reduce((sum, workout) => sum + workout.volume, 0)
          const averageRpe = processedData.length > 0 
            ? processedData.reduce((sum, workout) => sum + workout.averageRpe, 0) / processedData.length 
            : 0

          setStats({
            totalWorkouts,
            totalVolume,
            averageRpe: Math.round(averageRpe * 10) / 10,
            streak: 3 // Mock streak
          })
        }

        // Load exercise-specific progress
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id, name, category')
          .limit(5)

        if (exercises) {
          // Mock exercise progress data
          const mockProgress: ExerciseProgress[] = exercises.map(exercise => ({
            exercise: exercise.name,
            currentBest: Math.floor(Math.random() * 15) + 5,
            previousBest: Math.floor(Math.random() * 12) + 3,
            improvement: Math.floor(Math.random() * 30) + 5,
            sessions: Math.floor(Math.random() * 10) + 5
          }))

          setExerciseProgress(mockProgress)
        }

      } catch (error) {
        console.error('Error loading analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [user])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  const consistencyData = [
    { name: 'Lun', workouts: 2 },
    { name: 'Mar', workouts: 3 },
    { name: 'Mer', workouts: 1 },
    { name: 'Jeu', workouts: 2 },
    { name: 'Ven', workouts: 3 },
    { name: 'Sam', workouts: 1 },
    { name: 'Dim', workouts: 0 }
  ]

  const categoryData = [
    { name: 'Push', value: 45, color: '#3B82F6' },
    { name: 'Pull', value: 35, color: '#10B981' },
    { name: 'Legs', value: 15, color: '#F59E0B' },
    { name: 'Core', value: 5, color: '#EF4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Progress Analytics
          </h1>
          <p className="text-gray-600">
            Track your strength progression and workout consistency
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground">
                reps completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average RPE</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRpe}</div>
              <p className="text-xs text-muted-foreground">
                out of 10
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak}</div>
              <p className="text-xs text-muted-foreground">
                days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Progress Charts</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Tracking</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="reports">Progress Reports</TabsTrigger>
            <TabsTrigger value="goals">Goals & Tracking</TabsTrigger>
            <TabsTrigger value="export">Export & Share</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Volume Progression</CardTitle>
                  <CardDescription>Total reps per workout session</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* RPE Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>RPE Trend</CardTitle>
                  <CardDescription>Average intensity per workout</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[6, 10]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="averageRpe" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consistency" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Consistency */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Consistency</CardTitle>
                  <CardDescription>Workouts per day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={consistencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Exercise Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Categories</CardTitle>
                  <CardDescription>Distribution by movement type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {categoryData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            <ExerciseTracking />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendAnalysis />
          </TabsContent>


          <TabsContent value="achievements" className="space-y-4">
            <AchievementSystem />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ProgressReports />
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <GoalTracking />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <ExportTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}