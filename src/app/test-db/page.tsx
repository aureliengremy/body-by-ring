'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Exercise {
  id: string
  name: string
  category: string
  difficulty_level: number
}

export default function TestDbPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔍 Testing Supabase connection...')
        
        // Test 1: Simple query to exercises table
        const { data, error } = await supabase
          .from('exercises')
          .select('id, name, category, difficulty_level')
          .limit(5)

        if (error) {
          console.error('❌ Database error:', error)
          setError(error.message)
        } else {
          console.log('✅ Database connected successfully!')
          console.log('📊 Sample exercises:', data)
          setExercises(data || [])
        }
      } catch (err) {
        console.error('❌ Connection failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔍 Testing Database Connection</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        {error ? '❌' : '✅'} Database Connection Test
      </h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure you've executed the database schema in Supabase Dashboard</small>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Database connected and working.
        </div>
      )}

      {exercises.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Sample Exercises:</h2>
          <div className="grid gap-2">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="p-3 border rounded">
                <strong>{exercise.name}</strong> - {exercise.category} (Level {exercise.difficulty_level})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Environment Check:</strong></p>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  )
}