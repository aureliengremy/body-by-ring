'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BarChart3
} from 'lucide-react'

interface TrendInsight {
  type: 'strength' | 'volume' | 'consistency' | 'recovery'
  title: string
  description: string
  trend: 'positive' | 'negative' | 'neutral'
  confidence: number
  recommendation: string
  timeframe: string
  metrics: {
    current: number
    previous: number
    change: number
    unit: string
  }
}

interface PerformancePrediction {
  exercise: string
  currentLevel: number
  predictedLevel: number
  timeframe: string
  confidence: number
  factors: string[]
}

export function TrendAnalysis() {
  // Mock trend insights
  const trendInsights: TrendInsight[] = [
    {
      type: 'strength',
      title: 'Pull-up Strength Trending Up',
      description: 'Your pull-up performance shows consistent improvement over the last 4 weeks.',
      trend: 'positive',
      confidence: 87,
      recommendation: 'Continue current progression. Consider adding weighted pull-ups when you reach 15 reps.',
      timeframe: 'Last 4 weeks',
      metrics: {
        current: 12,
        previous: 8,
        change: 50,
        unit: 'reps'
      }
    },
    {
      type: 'consistency',
      title: 'Training Frequency Plateau',
      description: 'Your workout consistency has stabilized at 3.2 sessions per week.',
      trend: 'neutral',
      confidence: 92,
      recommendation: 'Consider adding one more session per week to break through strength plateaus.',
      timeframe: 'Last 6 weeks',
      metrics: {
        current: 3.2,
        previous: 3.1,
        change: 3.2,
        unit: 'sessions/week'
      }
    },
    {
      type: 'recovery',
      title: 'RPE Increasing - Potential Overreaching',
      description: 'Average RPE has increased from 7.2 to 8.1 over the past 3 weeks.',
      trend: 'negative',
      confidence: 78,
      recommendation: 'Consider a deload week or reducing training intensity by 20%.',
      timeframe: 'Last 3 weeks',
      metrics: {
        current: 8.1,
        previous: 7.2,
        change: 12.5,
        unit: 'RPE'
      }
    },
    {
      type: 'volume',
      title: 'Weekly Volume Growing Steadily',
      description: 'Total weekly volume has increased consistently without compromising form.',
      trend: 'positive',
      confidence: 85,
      recommendation: 'Excellent progress. Monitor RPE to avoid overtraining.',
      timeframe: 'Last 8 weeks',
      metrics: {
        current: 280,
        previous: 220,
        change: 27.3,
        unit: 'reps/week'
      }
    }
  ]

  // Mock performance predictions
  const predictions: PerformancePrediction[] = [
    {
      exercise: 'Pull-ups',
      currentLevel: 12,
      predictedLevel: 15,
      timeframe: '4 weeks',
      confidence: 82,
      factors: ['Consistent weekly progression', 'Good RPE management', 'Proper rest periods']
    },
    {
      exercise: 'Push-ups',
      currentLevel: 25,
      predictedLevel: 30,
      timeframe: '6 weeks',
      confidence: 65,
      factors: ['Currently plateauing', 'May need progression variation', 'Low current RPE']
    },
    {
      exercise: 'Dips',
      currentLevel: 8,
      predictedLevel: 12,
      timeframe: '8 weeks',
      confidence: 45,
      factors: ['Recent performance decline', 'High RPE indicates fatigue', 'Form review needed']
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-blue-100 text-blue-800'
      case 'volume':
        return 'bg-green-100 text-green-800'
      case 'consistency':
        return 'bg-purple-100 text-purple-800'
      case 'recovery':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (confidence >= 60) return <Activity className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Performance Trend Analysis
        </h2>
        <p className="text-gray-600">
          AI-powered insights into your training patterns and progress
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
        {trendInsights.map((insight, index) => (
          <Card key={index} className={`border-l-4 ${getTrendColor(insight.trend)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge className={getTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {insight.timeframe}
                    </span>
                    <span className="flex items-center gap-1">
                      {getConfidenceIcon(insight.confidence)}
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
                <Badge className={getTrendColor(insight.trend)} variant="outline">
                  {getTrendIcon(insight.trend)}
                  {insight.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 mb-3">{insight.description}</p>
              
              {/* Metrics */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {insight.metrics.previous}
                    </div>
                    <div className="text-xs text-gray-600">Previous</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {insight.metrics.current}
                    </div>
                    <div className="text-xs text-gray-600">Current</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${
                      insight.trend === 'positive' ? 'text-green-600' : 
                      insight.trend === 'negative' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {insight.trend === 'positive' ? '+' : insight.trend === 'negative' ? '-' : ''}
                      {Math.abs(insight.metrics.change)}%
                    </div>
                    <div className="text-xs text-gray-600">Change</div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Recommendation</h5>
                <p className="text-sm text-blue-800">{insight.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Predictions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {prediction.exercise}
                  <span className="flex items-center gap-1 text-sm font-normal text-gray-600">
                    {getConfidenceIcon(prediction.confidence)}
                    {prediction.confidence}%
                  </span>
                </CardTitle>
                <CardDescription>
                  Predicted in {prediction.timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {prediction.predictedLevel}
                  </div>
                  <div className="text-sm text-gray-600">
                    From {prediction.currentLevel} (+{prediction.predictedLevel - prediction.currentLevel})
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Key Factors</h5>
                  <ul className="space-y-1">
                    {prediction.factors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Based on your current trends and patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Continue Current Pull-up Program</div>
                <div className="text-sm text-green-800">Your pull-up progression is excellent. Maintain current volume and intensity.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-900">Schedule Deload Week</div>
                <div className="text-sm text-yellow-800">Rising RPE suggests you need a recovery period. Plan a 40% volume reduction next week.</div>
                <Button size="sm" variant="outline" className="mt-2">
                  Schedule Deload
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Progress Push-up Variation</div>
                <div className="text-sm text-blue-800">Consider advancing to archer push-ups or ring push-ups to continue strength gains.</div>
                <Button size="sm" variant="outline" className="mt-2">
                  View Progressions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}