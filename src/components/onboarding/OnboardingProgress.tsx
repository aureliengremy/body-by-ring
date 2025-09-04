'use client'

interface OnboardingProgressProps {
  currentStep: string
  progress: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, progress, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Step {Math.floor((progress / 100) * totalSteps)} of {totalSteps}</span>
        <span>{progress}% Complete</span>
      </div>
    </div>
  )
}