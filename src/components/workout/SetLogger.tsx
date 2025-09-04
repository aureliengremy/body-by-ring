'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Exercise } from '@/types/exercise'

interface SetData {
  set_number: number
  target_reps_min?: number
  target_reps_max?: number
  actual_reps?: number
  rpe?: number
  tempo?: string
  notes?: string
  completed: boolean
}

interface SetLoggerProps {
  exercise: Exercise
  setData: SetData
  onUpdate: (data: SetData) => void
  onComplete: () => void
  isActive: boolean
  showTarget?: boolean
}

export function SetLogger({ 
  exercise, 
  setData, 
  onUpdate, 
  onComplete,
  isActive,
  showTarget = true 
}: SetLoggerProps) {
  const [repsInput, setRepsInput] = useState(setData.actual_reps?.toString() || '')
  const [rpeInput, setRpeInput] = useState(setData.rpe?.toString() || '')
  const [notesInput, setNotesInput] = useState(setData.notes || '')

  const handleRepsChange = (value: string) => {
    setRepsInput(value)
    const numValue = value ? parseInt(value) : undefined
    onUpdate({ ...setData, actual_reps: numValue })
  }

  const handleRpeChange = (value: string) => {
    setRpeInput(value)
    const numValue = value ? parseInt(value) : undefined
    onUpdate({ ...setData, rpe: numValue })
  }

  const handleNotesChange = (value: string) => {
    setNotesInput(value)
    onUpdate({ ...setData, notes: value })
  }

  const handleComplete = () => {
    onUpdate({ ...setData, completed: true })
    onComplete()
  }

  const canComplete = setData.actual_reps !== undefined && setData.actual_reps > 0

  return (
    <Card className={`transition-all ${
      isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 
      setData.completed ? 'bg-green-50 border-green-200' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-medium text-lg">
              Set {setData.set_number}
            </h4>
            {showTarget && (setData.target_reps_min || setData.target_reps_max) && (
              <p className="text-sm text-gray-600">
                Target: {setData.target_reps_min === setData.target_reps_max 
                  ? `${setData.target_reps_min} reps`
                  : `${setData.target_reps_min}-${setData.target_reps_max} reps`
                }
              </p>
            )}
          </div>
          
          {setData.completed && (
            <div className="flex items-center gap-1 text-green-600">
              <span className="text-sm font-medium">✓ Complete</span>
            </div>
          )}
        </div>

        {isActive && !setData.completed && (
          <div className="space-y-4">
            {/* Reps Input */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`reps-${setData.set_number}`}>
                  Reps Completed
                </Label>
                <Input
                  id={`reps-${setData.set_number}`}
                  type="number"
                  value={repsInput}
                  onChange={(e) => handleRepsChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              {/* RPE Input */}
              <div className="space-y-2">
                <Label htmlFor={`rpe-${setData.set_number}`}>
                  RPE (6-10)
                </Label>
                <Select value={rpeInput} onValueChange={handleRpeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate effort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 - Easy</SelectItem>
                    <SelectItem value="7">7 - Moderate</SelectItem>
                    <SelectItem value="8">8 - Hard</SelectItem>
                    <SelectItem value="9">9 - Very Hard</SelectItem>
                    <SelectItem value="10">10 - Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor={`notes-${setData.set_number}`}>
                Notes (Optional)
              </Label>
              <Input
                id={`notes-${setData.set_number}`}
                value={notesInput}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="How did this set feel?"
              />
            </div>

            {/* Complete Button */}
            <Button 
              onClick={handleComplete}
              disabled={!canComplete}
              className="w-full"
            >
              Complete Set {setData.set_number}
            </Button>
          </div>
        )}

        {setData.completed && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Reps:</span>
              <span className="font-medium">{setData.actual_reps}</span>
            </div>
            {setData.rpe && (
              <div className="flex justify-between">
                <span>RPE:</span>
                <span className="font-medium">{setData.rpe}/10</span>
              </div>
            )}
            {setData.notes && (
              <div className="mt-2">
                <span className="text-gray-600">Notes:</span>
                <p className="text-gray-700 text-sm mt-1">{setData.notes}</p>
              </div>
            )}
          </div>
        )}

        {!isActive && !setData.completed && (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">Complete previous sets first</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}