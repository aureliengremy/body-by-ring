'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Exercise } from '@/types/exercise'
import { 
  DIFFICULTY_LABELS, 
  CATEGORY_INFO, 
  getDifficultyColorClass, 
  getCategoryColorClass 
} from '@/types/exercise'

export default function ExerciseDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const exerciseId = params.id as string
  
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load exercise details
  useEffect(() => {
    async function loadExercise() {
      if (!exerciseId) return

      try {
        // Load main exercise
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', exerciseId)
          .single()

        if (exerciseError) {
          if (exerciseError.code === 'PGRST116') {
            setError('Exercise not found')
          } else {
            throw exerciseError
          }
          return
        }

        setExercise(exerciseData)

        // Load related exercises (same category, similar difficulty)
        const { data: relatedData, error: relatedError } = await supabase
          .from('exercises')
          .select('*')
          .eq('category', exerciseData.category)
          .neq('id', exerciseId)
          .gte('difficulty_level', Math.max(1, exerciseData.difficulty_level - 2))
          .lte('difficulty_level', Math.min(10, exerciseData.difficulty_level + 2))
          .limit(4)

        if (!relatedError && relatedData) {
          setRelatedExercises(relatedData)
        }

      } catch (err) {
        console.error('Error loading exercise:', err)
        setError('Failed to load exercise details')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadExercise()
    }
  }, [user, exerciseId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading exercise...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Exercise Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The exercise you're looking for doesn't exist or couldn't be loaded.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => router.push('/exercises')}>
              Browse Exercises
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const difficultyInfo = DIFFICULTY_LABELS[exercise.difficulty_level as keyof typeof DIFFICULTY_LABELS]
  const categoryInfo = CATEGORY_INFO[exercise.category]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
        </div>

        {/* Main Exercise Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-4">{exercise.name}</CardTitle>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryInfo.emoji}</span>
                    <span className={`px-3 py-1 rounded-lg font-medium ${getCategoryColorClass(exercise.category)}`}>
                      {categoryInfo.name}
                    </span>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-full font-medium border ${getDifficultyColorClass(exercise.difficulty_level)}`}>
                    Level {exercise.difficulty_level} - {difficultyInfo?.label || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="text-lg">
              {categoryInfo.description} • {difficultyInfo?.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {/* Video/Image Placeholder */}
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                {exercise.video_url ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎥</div>
                    <p className="text-gray-600">Video demonstration coming soon</p>
                    <p className="text-sm text-gray-500 mt-1">URL: {exercise.video_url}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">{categoryInfo.emoji}</div>
                    <p className="text-gray-600">Visual demonstration coming soon</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Instructions</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {exercise.instructions}
                  </p>
                </div>
              </div>

              {/* Exercise Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Primary Muscles</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryInfo.muscles.map(muscle => (
                      <span 
                        key={muscle} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Equipment Needed</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Bodyweight Only
                    </span>
                    {/* TODO: Add equipment tags from database */}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button className="flex-1">
                  Add to Current Workout
                </Button>
                <Button variant="outline" className="flex-1">
                  Save to Favorites
                </Button>
                <Button variant="outline">
                  Share Exercise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Progression */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Difficulty Progression</CardTitle>
            <CardDescription>
              Master the fundamentals before advancing to harder variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Level Indicator */}
              <div className="flex items-center justify-center py-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    You Are Here
                  </div>
                  <div className="text-lg text-blue-800">
                    {exercise.name} (Level {exercise.difficulty_level})
                  </div>
                </div>
              </div>

              {/* Progression Levels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Previous Level */}
                {exercise.difficulty_level > 1 && (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-600 font-medium mb-2">
                      ✅ Foundation Level
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {exercise.difficulty_level - 1} exercises
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Build your base here first
                    </div>
                  </div>
                )}

                {/* Current Level */}
                <div className="text-center p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="text-blue-600 font-medium mb-2">
                    🎯 Current Level
                  </div>
                  <div className="text-sm text-gray-600">
                    Level {exercise.difficulty_level}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    You are working on this level
                  </div>
                </div>

                {/* Next Level */}
                {exercise.difficulty_level < 10 && (
                  <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-orange-600 font-medium mb-2">
                      🚀 Next Challenge
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {exercise.difficulty_level + 1} exercises
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Your next goal to work towards
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Exercises */}
        {relatedExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Exercises</CardTitle>
              <CardDescription>
                Other {categoryInfo.name.toLowerCase()} exercises you might like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedExercises.map(related => {
                  const relatedDifficulty = DIFFICULTY_LABELS[related.difficulty_level as keyof typeof DIFFICULTY_LABELS]
                  return (
                    <div 
                      key={related.id}
                      onClick={() => router.push(`/exercises/${related.id}`)}
                      className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{related.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColorClass(related.difficulty_level)}`}>
                          L{related.difficulty_level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {related.instructions.substring(0, 100)}...
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}