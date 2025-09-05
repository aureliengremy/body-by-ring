'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  assessExperienceLevel, 
  getAssessmentExplanation, 
  getPersonalizedRecommendations,
  type AssessmentData,
  type ExperienceLevel 
} from '@/lib/experience-assessment'

interface AssessmentResultProps {
  assessmentData: AssessmentData
  onContinue: (level: ExperienceLevel) => void
  onRetake: () => void
}

export default function AssessmentResult({ 
  assessmentData, 
  onContinue, 
  onRetake 
}: AssessmentResultProps) {
  const experienceLevel = assessExperienceLevel(assessmentData)
  const explanation = getAssessmentExplanation(experienceLevel, assessmentData)
  const recommendations = getPersonalizedRecommendations(experienceLevel, assessmentData)

  const levelStyles = {
    beginner: {
      gradient: 'from-green-400 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      emoji: '🌱'
    },
    intermediate: {
      gradient: 'from-blue-400 to-blue-600', 
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      emoji: '💪'
    },
    advanced: {
      gradient: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50', 
      border: 'border-purple-200',
      emoji: '🚀'
    }
  }

  const style = levelStyles[experienceLevel]

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className={`${style.bg} ${style.border} border-2`}>
        <CardHeader className="text-center">
          <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center text-4xl mb-4`}>
            {style.emoji}
          </div>
          <CardTitle className="text-2xl capitalize">
            {experienceLevel} Level
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            {explanation.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-3">
                  {paragraph.includes('**') 
                    ? paragraph.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )
                    : paragraph
                  }
                </p>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Starting Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏋️ Your Starting Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.startingExercises.map((exercise, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="font-medium">{exercise}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Recommended Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 font-medium">
            {recommendations.weeklySchedule}
          </p>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Your Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.focusAreas.map((area, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚠️ Important Safety Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.safeguards.map((safeguard, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">{safeguard}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">📊 Your Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-600">Push-ups</div>
              <div className="text-lg font-bold">{assessmentData.can_do_pushups}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Pull-ups</div>
              <div className="text-lg font-bold">{assessmentData.can_do_pullups}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Plank Hold</div>
              <div className="text-lg font-bold">{assessmentData.can_hold_plank}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          onClick={() => onContinue(experienceLevel)}
          className={`flex-1 bg-gradient-to-r ${style.gradient} hover:opacity-90 text-white`}
          size="lg"
        >
          Create My Program 🚀
        </Button>
        
        <Button 
          onClick={onRetake}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Retake Assessment
        </Button>
      </div>
    </div>
  )
}