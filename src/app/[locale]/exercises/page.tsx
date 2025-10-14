'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/exercises/ExerciseCard'
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters'
import type { Exercise, ExerciseFilter, ExerciseSortOption } from '@/types/exercise'
import { filterExercises, sortExercises } from '@/types/exercise'

export default function ExercisesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filter, setFilter] = useState<ExerciseFilter>({})
  const [sort, setSort] = useState<ExerciseSortOption>({ field: 'name', direction: 'asc' })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load exercises from database
  useEffect(() => {
    async function loadExercises() {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('difficulty_level', { ascending: true })

        if (error) throw error

        setExercises(data || [])
      } catch (err) {
        console.error('Error loading exercises:', err)
        setError('Failed to load exercises')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadExercises()
    }
  }, [user])

  // Apply filters and sorting
  useEffect(() => {
    let result = filterExercises(exercises, filter)
    result = sortExercises(result, sort)
    setFilteredExercises(result)
  }, [exercises, filter, sort])

  const handleFilterChange = (newFilter: ExerciseFilter) => {
    setFilter(newFilter)
  }

  const handleSortChange = (newSort: ExerciseSortOption) => {
    setSort(newSort)
  }

  const handleResetFilters = () => {
    setFilter({})
    setSort({ field: 'name', direction: 'asc' })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading exercises...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Exercise Library 💪
              </h1>
              <p className="text-gray-600 mt-2">
                Discover and master calisthenics movements
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                ← Dashboard
              </Button>
              
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ExerciseFilters
                filter={filter}
                sort={sort}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onReset={handleResetFilters}
                exerciseCount={filteredExercises.length}
                totalCount={exercises.length}
              />
            </div>
          </div>

          {/* Main Content - Exercise Grid */}
          <div className="lg:col-span-3">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exercises found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={handleResetFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {filteredExercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            {/* Load More Button (for future pagination) */}
            {filteredExercises.length > 0 && filteredExercises.length === exercises.length && (
              <div className="text-center mt-8 py-4 text-gray-500">
                <p>Showing all {filteredExercises.length} exercises</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}