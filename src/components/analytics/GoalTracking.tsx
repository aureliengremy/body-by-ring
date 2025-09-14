'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target,
  Calendar,
  Trophy,
  Plus,
  CheckCircle2,
  Clock,
  Flag,
  Zap
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'strength' | 'volume' | 'consistency' | 'skill'
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  status: 'active' | 'completed' | 'overdue' | 'paused'
  priority: 'low' | 'medium' | 'high'
  milestones: {
    value: number
    date?: string
    achieved: boolean
  }[]
  createdAt: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: string
}

export function GoalTracking() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock goals
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Master Pull-ups',
        description: 'Achieve 15 consecutive pull-ups',
        category: 'strength',
        targetValue: 15,
        currentValue: 12,
        unit: 'reps',
        deadline: '2024-04-15',
        status: 'active',
        priority: 'high',
        milestones: [
          { value: 5, date: '2024-02-01', achieved: true },
          { value: 10, date: '2024-02-25', achieved: true },
          { value: 12, date: '2024-03-10', achieved: true },
          { value: 15, achieved: false }
        ],
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Consistency Champion',
        description: 'Complete 4 workouts per week for 8 weeks',
        category: 'consistency',
        targetValue: 32,
        currentValue: 24,
        unit: 'workouts',
        deadline: '2024-04-01',
        status: 'active',
        priority: 'medium',
        milestones: [
          { value: 8, date: '2024-02-15', achieved: true },
          { value: 16, date: '2024-03-01', achieved: true },
          { value: 24, date: '2024-03-15', achieved: true },
          { value: 32, achieved: false }
        ],
        createdAt: '2024-02-01'
      },
      {
        id: '3',
        title: 'Volume Beast',
        description: 'Complete 1000 total reps in a month',
        category: 'volume',
        targetValue: 1000,
        currentValue: 850,
        unit: 'reps',
        deadline: '2024-03-31',
        status: 'active',
        priority: 'medium',
        milestones: [
          { value: 250, date: '2024-03-07', achieved: true },
          { value: 500, date: '2024-03-14', achieved: true },
          { value: 750, date: '2024-03-21', achieved: true },
          { value: 850, date: '2024-03-25', achieved: true },
          { value: 1000, achieved: false }
        ],
        createdAt: '2024-03-01'
      },
      {
        id: '4',
        title: 'Handstand Hold',
        description: 'Hold a freestanding handstand for 30 seconds',
        category: 'skill',
        targetValue: 30,
        currentValue: 0,
        unit: 'seconds',
        deadline: '2024-06-01',
        status: 'active',
        priority: 'low',
        milestones: [
          { value: 5, achieved: false },
          { value: 10, achieved: false },
          { value: 20, achieved: false },
          { value: 30, achieved: false }
        ],
        createdAt: '2024-02-15'
      }
    ]

    // Generate mock achievements
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Pull-up',
        description: 'Completed your first unassisted pull-up',
        icon: '🎯',
        unlockedAt: '2024-02-01',
        category: 'strength'
      },
      {
        id: '2',
        title: 'Consistency Starter',
        description: 'Completed workouts 5 days in a row',
        icon: '🔥',
        unlockedAt: '2024-02-10',
        category: 'consistency'
      },
      {
        id: '3',
        title: 'Volume Milestone',
        description: 'Completed 500 reps in a single week',
        icon: '💪',
        unlockedAt: '2024-02-20',
        category: 'volume'
      },
      {
        id: '4',
        title: 'Perfect Form',
        description: 'Maintained RPE below 8 for an entire week',
        icon: '⭐',
        unlockedAt: '2024-03-01',
        category: 'technique'
      },
      {
        id: '5',
        title: 'Double Digits',
        description: 'Achieved 10+ pull-ups in a single set',
        icon: '🚀',
        unlockedAt: '2024-03-10',
        category: 'strength'
      }
    ]

    setGoals(mockGoals)
    setAchievements(mockAchievements)
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-blue-100 text-blue-800'
      case 'volume':
        return 'bg-green-100 text-green-800'
      case 'consistency':
        return 'bg-purple-100 text-purple-800'
      case 'skill':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const activeGoals = goals.filter(goal => goal.status === 'active').length
  const completedGoals = goals.filter(goal => goal.status === 'completed').length
  const totalProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + calculateProgress(goal.currentValue, goal.targetValue), 0) / goals.length 
    : 0

  if (isLoading) {
    return <div>Loading goal tracking...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Goal Setting & Tracking
          </h2>
          <p className="text-gray-600">
            Set, track, and achieve your fitness goals
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{activeGoals}</div>
                <div className="text-sm text-gray-600">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{completedGoals}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'strength', 'volume', 'consistency', 'skill'].map(category => (
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

      {/* Active Goals */}
      <div className="grid gap-4">
        {filteredGoals.map((goal) => {
          const progress = calculateProgress(goal.currentValue, goal.targetValue)
          const daysUntil = getDaysUntilDeadline(goal.deadline)
          
          return (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <CardDescription className="mb-2">
                      {goal.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {daysUntil > 0 ? `${daysUntil} days left` : 'Overdue'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {new Date(goal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-right mt-1">
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Milestones</h4>
                  <div className="flex flex-wrap gap-2">
                    {goal.milestones.map((milestone, idx) => (
                      <Badge
                        key={idx}
                        variant={milestone.achieved ? 'default' : 'outline'}
                        className={milestone.achieved ? 'bg-green-100 text-green-800' : ''}
                      >
                        {milestone.achieved && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {milestone.value} {goal.unit}
                        {milestone.date && milestone.achieved && (
                          <span className="ml-1 text-xs">
                            ({new Date(milestone.date).toLocaleDateString()})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Your latest unlocked achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-semibold text-yellow-800">
                    {achievement.title}
                  </div>
                  <div className="text-sm text-yellow-700">
                    {achievement.description}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}