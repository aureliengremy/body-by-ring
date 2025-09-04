'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExerciseCategory, ExerciseFilter, ExerciseSortOption } from '@/types/exercise'
import { CATEGORY_INFO, DIFFICULTY_LABELS } from '@/types/exercise'

interface ExerciseFiltersProps {
  filter: ExerciseFilter
  sort: ExerciseSortOption
  onFilterChange: (filter: ExerciseFilter) => void
  onSortChange: (sort: ExerciseSortOption) => void
  onReset: () => void
  exerciseCount: number
  totalCount: number
}

export function ExerciseFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onReset,
  exerciseCount,
  totalCount
}: ExerciseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const categories = Object.entries(CATEGORY_INFO) as [ExerciseCategory, typeof CATEGORY_INFO[ExerciseCategory]][]

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, search_term: value || undefined })
  }

  const handleCategoryToggle = (category: ExerciseCategory) => {
    const currentCategories = filter.category || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    onFilterChange({ 
      ...filter, 
      category: newCategories.length > 0 ? newCategories : undefined 
    })
  }

  const handleDifficultyChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined
    onFilterChange({
      ...filter,
      [`difficulty_${type}`]: numValue
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Filters & Search
          </CardTitle>
          <div className="text-sm text-gray-600">
            {exerciseCount} of {totalCount} exercises
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search exercises</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name or instructions..."
            value={filter.search_term || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(([key, info]) => {
              const isSelected = filter.category?.includes(key) || false
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryToggle(key)}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.emoji}</span>
                    <div>
                      <div className="font-medium">{info.name}</div>
                      <div className="text-xs text-gray-500">{info.muscles.join(', ')}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <div className="flex gap-2">
            <Select
              value={sort.field}
              onValueChange={(field: any) => onSortChange({ ...sort, field })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="difficulty_level">Difficulty</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={sort.direction}
              onValueChange={(direction: any) => onSortChange({ ...sort, direction })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z / Low-High</SelectItem>
                <SelectItem value="desc">Z-A / High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Difficulty</Label>
                <Select
                  value={filter.difficulty_min?.toString() || ''}
                  onValueChange={(value) => handleDifficultyChange('min', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {Object.entries(DIFFICULTY_LABELS).map(([level, info]) => (
                      <SelectItem key={level} value={level}>
                        Level {level} - {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Difficulty</Label>
                <Select
                  value={filter.difficulty_max?.toString() || ''}
                  onValueChange={(value) => handleDifficultyChange('max', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {Object.entries(DIFFICULTY_LABELS).map(([level, info]) => (
                      <SelectItem key={level} value={level}>
                        Level {level} - {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(filter.search_term || filter.category?.length || filter.difficulty_min || filter.difficulty_max) && (
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}