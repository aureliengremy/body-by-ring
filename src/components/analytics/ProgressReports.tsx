'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  Download,
  Calendar
} from 'lucide-react'

interface WeeklyReport {
  weekStart: string
  weekEnd: string
  workoutsCompleted: number
  targetWorkouts: number
  totalVolume: number
  averageRpe: number
  consistencyScore: number
  improvements: string[]
  challenges: string[]
  nextWeekGoals: string[]
}

interface MonthlyReport {
  month: string
  year: number
  workoutsCompleted: number
  targetWorkouts: number
  totalVolume: number
  volumeChange: number
  strengthGains: {
    exercise: string
    improvement: number
    unit: string
  }[]
  consistencyRate: number
  achievements: string[]
  recommendations: string[]
}

export function ProgressReports() {
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock weekly reports
    const mockWeeklyReports: WeeklyReport[] = [
      {
        weekStart: '2024-03-04',
        weekEnd: '2024-03-10',
        workoutsCompleted: 4,
        targetWorkouts: 4,
        totalVolume: 280,
        averageRpe: 7.5,
        consistencyScore: 100,
        improvements: [
          'Completed all planned workouts',
          'Increased pull-ups from 8 to 10 reps',
          'Better rest period management'
        ],
        challenges: [
          'Struggled with dips progression',
          'RPE was higher than expected on push days'
        ],
        nextWeekGoals: [
          'Focus on dips form and tempo',
          'Add extra warm-up for shoulders',
          'Maintain current volume'
        ]
      },
      {
        weekStart: '2024-02-26',
        weekEnd: '2024-03-03',
        workoutsCompleted: 3,
        targetWorkouts: 4,
        totalVolume: 245,
        averageRpe: 8.2,
        consistencyScore: 75,
        improvements: [
          'Improved push-up form significantly',
          'Better recovery between sessions'
        ],
        challenges: [
          'Missed one workout due to schedule',
          'Higher RPE indicates need for deload'
        ],
        nextWeekGoals: [
          'Prioritize consistency - plan workout times',
          'Consider reducing volume slightly',
          'Focus on recovery'
        ]
      }
    ]

    // Generate mock monthly reports
    const mockMonthlyReports: MonthlyReport[] = [
      {
        month: 'February',
        year: 2024,
        workoutsCompleted: 14,
        targetWorkouts: 16,
        totalVolume: 1050,
        volumeChange: +12,
        strengthGains: [
          { exercise: 'Pull-ups', improvement: 25, unit: '%' },
          { exercise: 'Push-ups', improvement: 15, unit: '%' },
          { exercise: 'Dips', improvement: 8, unit: '%' }
        ],
        consistencyRate: 87.5,
        achievements: [
          'First month completing 12+ workouts',
          'Achieved first full pull-up',
          'Consistent 4-day per week schedule'
        ],
        recommendations: [
          'Consider adding one more rest day',
          'Focus on dips progression',
          'Track sleep quality for better recovery'
        ]
      }
    ]

    setWeeklyReports(mockWeeklyReports)
    setMonthlyReports(mockMonthlyReports)
    setIsLoading(false)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const getConsistencyColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPerformanceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Target className="h-4 w-4 text-gray-600" />
  }

  if (isLoading) {
    return <div>Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            Progress Reports
          </h2>
          <p className="text-gray-600">
            Detailed analysis of your training progress
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Reports</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          {weeklyReports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Week of {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                    </CardTitle>
                    <CardDescription>
                      Weekly performance summary and insights
                    </CardDescription>
                  </div>
                  <Badge className={getConsistencyColor(report.consistencyScore)}>
                    {report.consistencyScore}% Consistency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.workoutsCompleted}/{report.targetWorkouts}
                    </div>
                    <div className="text-sm text-gray-600">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.totalVolume}
                    </div>
                    <div className="text-sm text-gray-600">Total Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {report.averageRpe}
                    </div>
                    <div className="text-sm text-gray-600">Avg RPE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {report.consistencyScore}%
                    </div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Improvements */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Improvements
                    </h4>
                    <ul className="space-y-1">
                      {report.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Challenges
                    </h4>
                    <ul className="space-y-1">
                      {report.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Week Goals */}
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Next Week Goals
                    </h4>
                    <ul className="space-y-1">
                      {report.nextWeekGoals.map((goal, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {monthlyReports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {report.month} {report.year}
                    </CardTitle>
                    <CardDescription>
                      Monthly performance analysis and trends
                    </CardDescription>
                  </div>
                  <Badge className={getConsistencyColor(report.consistencyRate)}>
                    {report.consistencyRate}% Success Rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.workoutsCompleted}
                    </div>
                    <div className="text-sm text-gray-600">
                      Workouts ({report.targetWorkouts} planned)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                      {report.totalVolume}
                      {getPerformanceIcon(report.volumeChange)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Volume (+{report.volumeChange}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {report.consistencyRate}%
                    </div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {report.achievements.length}
                    </div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                </div>

                {/* Strength Gains */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Strength Gains</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {report.strengthGains.map((gain, idx) => (
                      <div key={idx} className="bg-green-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-green-700">
                          {gain.exercise}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          +{gain.improvement}{gain.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Achievements
                    </h4>
                    <ul className="space-y-1">
                      {report.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">🏆</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">💡</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}