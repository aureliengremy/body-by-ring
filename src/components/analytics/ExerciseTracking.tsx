'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Activity,
  Award,
  Zap
} from 'lucide-react'

interface ExerciseData {
  date: string
  reps: number
  rpe: number
  volume: number
}

interface ExerciseAnalysis {
  id: string
  name: string
  category: 'push' | 'pull' | 'legs' | 'core'
  currentMax: number
  personalBest: number
  avgRpe: number
  totalSessions: number
  progressTrend: 'improving' | 'plateau' | 'declining'
  data: ExerciseData[]
  insights: string[]
  nextTarget: {
    reps: number
    timeframe: string
  }
}

export function ExerciseTracking() {
  const [exercises, setExercises] = useState<ExerciseAnalysis[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock exercise tracking data
    const mockExercises: ExerciseAnalysis[] = [
      {
        id: '1',
        name: 'Pull-ups',
        category: 'pull',
        currentMax: 12,
        personalBest: 12,
        avgRpe: 7.8,
        totalSessions: 15,
        progressTrend: 'improving',
        data: [
          { date: '01/03', reps: 8, rpe: 8, volume: 32 },
          { date: '03/03', reps: 9, rpe: 7, volume: 36 },
          { date: '05/03', reps: 10, reps: 8, volume: 38 },
          { date: '07/03', reps: 10, rpe: 7, volume: 40 },
          { date: '09/03', reps: 12, rpe: 8, volume: 44 },
          { date: '11/03', reps: 12, rpe: 7, volume: 45 }
        ],
        insights: [
          'Consistent improvement in max reps (+50% in 4 weeks)',
          'RPE trending down - good adaptation',
          'Volume increasing steadily'
        ],
        nextTarget: {
          reps: 15,
          timeframe: '2 weeks'
        }
      },
      {
        id: '2',
        name: 'Push-ups',
        category: 'push',
        currentMax: 25,
        personalBest: 25,
        avgRpe: 6.5,
        totalSessions: 18,
        progressTrend: 'plateau',
        data: [
          { date: '01/03', reps: 20, rpe: 7, volume: 80 },
          { date: '03/03', reps: 22, rpe: 7, volume: 84 },
          { date: '05/03', reps: 23, rpe: 6, volume: 88 },
          { date: '07/03', reps: 24, rpe: 6, volume: 90 },
          { date: '09/03', reps: 25, rpe: 7, volume: 92 },
          { date: '11/03', reps: 25, rpe: 6, volume: 94 }
        ],
        insights: [
          'Plateauing at 25 reps - consider progression',
          'Low RPE suggests ready for harder variation',
          'Consider archer push-ups or ring push-ups'
        ],
        nextTarget: {
          reps: 5,
          timeframe: 'archer push-ups in 3 weeks'
        }
      },
      {
        id: '3',
        name: 'Dips',
        category: 'push',
        currentMax: 8,
        personalBest: 10,
        avgRpe: 8.2,
        totalSessions: 12,
        progressTrend: 'declining',
        data: [
          { date: '01/03', reps: 10, rpe: 8, volume: 28 },
          { date: '03/03', reps: 9, rpe: 8, volume: 26 },
          { date: '05/03', reps: 8, rpe: 8, volume: 24 },
          { date: '07/03', reps: 9, rpe: 9, volume: 25 },
          { date: '09/03', reps: 8, rpe: 8, volume: 22 },
          { date: '11/03', reps: 8, rpe: 8, volume: 24 }
        ],
        insights: [
          'Recent decline in performance - check recovery',
          'High RPE indicates fatigue or form issues',
          'Consider deload or form review'
        ],
        nextTarget: {
          reps: 12,
          timeframe: 'recovery focus for 2 weeks'
        }
      },
      {
        id: '4',
        name: 'Squats',
        category: 'legs',
        currentMax: 30,
        personalBest: 32,
        avgRpe: 7.1,
        totalSessions: 10,
        progressTrend: 'improving',
        data: [
          { date: '02/03', reps: 25, rpe: 7, volume: 75 },
          { date: '04/03', reps: 28, rpe: 7, volume: 84 },
          { date: '06/03', reps: 30, rpe: 7, volume: 90 },
          { date: '08/03', reps: 30, rpe: 6, volume: 88 },
          { date: '10/03', reps: 32, rpe: 8, volume: 92 },
          { date: '12/03', reps: 30, rpe: 7, volume: 90 }
        ],
        insights: [
          'Solid progress in leg strength',
          'Consider adding jump squats for power',
          'Volume management is good'
        ],
        nextTarget: {
          reps: 35,
          timeframe: '3 weeks'
        }
      }
    ]

    setExercises(mockExercises)
    setIsLoading(false)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800'
      case 'declining':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'push':
        return 'bg-blue-100 text-blue-800'
      case 'pull':
        return 'bg-green-100 text-green-800'
      case 'legs':
        return 'bg-purple-100 text-purple-800'
      case 'core':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.category === selectedCategory)

  if (isLoading) {
    return <div>Loading exercise tracking...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Exercise-Specific Tracking
          </h2>
          <p className="text-gray-600">
            Detailed progression analysis for each movement
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'push', 'pull', 'legs', 'core'].map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="grid gap-6">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{exercise.name}</CardTitle>
                  <Badge className={getCategoryColor(exercise.category)}>
                    {exercise.category}
                  </Badge>
                  <Badge className={getTrendColor(exercise.progressTrend)}>
                    {getTrendIcon(exercise.progressTrend)}
                    {exercise.progressTrend}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {exercise.currentMax}
                  </div>
                  <div className="text-sm text-gray-600">Current Max</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div>
                  <h4 className="font-semibold mb-3">Reps Progression</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={exercise.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="reps" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* RPE Trend */}
                <div>
                  <h4 className="font-semibold mb-3">RPE Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={exercise.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[5, 10]} />
                      <Tooltip />
                      <Bar dataKey="rpe" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {exercise.personalBest}
                  </div>
                  <div className="text-sm text-gray-600">Personal Best</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {exercise.avgRpe}
                  </div>
                  <div className="text-sm text-gray-600">Avg RPE</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {exercise.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {exercise.nextTarget.reps}
                  </div>
                  <div className="text-sm text-gray-600">Next Target</div>
                </div>
              </div>

              {/* Insights and Next Target */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Key Insights
                  </h4>
                  <ul className="space-y-1">
                    {exercise.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Next Target
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-900">
                      {exercise.nextTarget.reps} reps
                    </div>
                    <div className="text-sm text-blue-700">
                      Target: {exercise.nextTarget.timeframe}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}