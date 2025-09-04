'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { OnboardingStep as OnboardingStepType, OnboardingData, AssessmentQuestion } from '@/types/onboarding'

interface OnboardingStepProps {
  step: OnboardingStepType
  formData: Partial<OnboardingData>
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  canGoBack: boolean
  isLastStep: boolean
}

export function OnboardingStep({
  step,
  formData,
  onUpdate,
  onNext,
  onPrevious,
  canGoBack,
  isLastStep
}: OnboardingStepProps) {
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialize current answers from form data
  useEffect(() => {
    const answers: Record<string, any> = {}
    step.questions.forEach(question => {
      const value = formData[question.id as keyof OnboardingData]
      if (value !== undefined) {
        answers[question.id] = value
      }
    })
    setCurrentAnswers(answers)
  }, [step.questions, formData])

  // Handle input changes
  function handleInputChange(questionId: string, value: any) {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // Handle multi-select changes
  function handleMultiSelectChange(questionId: string, optionValue: string, checked: boolean) {
    const currentArray = currentAnswers[questionId] || []
    const newArray = checked 
      ? [...currentArray, optionValue]
      : currentArray.filter((item: string) => item !== optionValue)
    
    handleInputChange(questionId, newArray)
  }

  // Validate current step
  function validateStep(): boolean {
    const errors: Record<string, string> = {}
    let isValid = true

    step.questions.forEach(question => {
      if (question.required) {
        const value = currentAnswers[question.id]
        
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          errors[question.id] = 'This field is required'
          isValid = false
        } else if (question.type === 'number') {
          const numValue = Number(value)
          if (isNaN(numValue)) {
            errors[question.id] = 'Please enter a valid number'
            isValid = false
          } else if (question.min !== undefined && numValue < question.min) {
            errors[question.id] = `Minimum value is ${question.min}`
            isValid = false
          } else if (question.max !== undefined && numValue > question.max) {
            errors[question.id] = `Maximum value is ${question.max}`
            isValid = false
          }
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  // Handle next button click
  function handleNext() {
    if (validateStep()) {
      onUpdate(currentAnswers)
      onNext()
    }
  }

  // Render individual question
  function renderQuestion(question: AssessmentQuestion) {
    const value = currentAnswers[question.id] || ''
    const error = validationErrors[question.id]

    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-sm text-gray-600">{question.description}</p>
            )}
            <Input
              id={question.id}
              type="text"
              value={value}
              placeholder={question.placeholder}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-sm text-gray-600">{question.description}</p>
            )}
            <Input
              id={question.id}
              type="number"
              value={value}
              min={question.min}
              max={question.max}
              onChange={(e) => handleInputChange(question.id, Number(e.target.value))}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-sm text-gray-600">{question.description}</p>
            )}
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(question.id, newValue)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'multiselect':
        const selectedValues = currentAnswers[question.id] || []
        return (
          <div key={question.id} className="space-y-2">
            <Label>
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-sm text-gray-600">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => handleMultiSelectChange(question.id, option.value, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{step.title}</CardTitle>
        <CardDescription className="text-base">
          {step.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Questions */}
        <div className="space-y-6">
          {step.questions.map(renderQuestion)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoBack}
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            className="px-8"
          >
            {isLastStep ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}