'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Target,
  Calendar,
  Activity,
  TrendingUp,
  Eye,
  Play
} from 'lucide-react'

interface Program {
  id: string
  name: string
  phase: number
  cycle_number: number
  status: string
  started_at: string
  created_at: string
  workouts?: {
    total: number
    completed: number
  }
}

export default function ProgramsPage() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPrograms = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load programs with workout statistics
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select(`
          *,
          workouts (
            id,
            completed_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (programError) throw programError

      // Process programs with workout stats
      const processedPrograms = programData.map(program => ({
        ...program,
        workouts: {
          total: program.workouts?.length || 0,
          completed: program.workouts?.filter((w: { completed_at?: string }) => w.completed_at).length || 0
        }
      }))

      setPrograms(processedPrograms)

    } catch (err) {
      console.error('Error loading programs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [user])

  const getPhaseLabel = (phase: number) => {
    const phases: Record<number, string> = {
      1: 'Foundation',
      2: 'Development',
      3: 'Mastery'
    }
    return phases[phase] || `Phase ${phase}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'paused':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const calculateProgress = (program: Program) => {
    if (!program.workouts?.total) return 0
    return Math.round((program.workouts.completed / program.workouts.total) * 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Programs</h1>
          <p className="text-gray-600">
            Manage your calisthenics training programs and track your progress
          </p>
        </div>
        <Button className="mt-4 md:mt-0" asChild>
          <Link href="/onboarding">
            <Plus className="w-4 h-4 mr-2" />
            Create New Program
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={loadPrograms} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Programs Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started with your calisthenics journey by creating your first personalized training program.
            </p>
            <Button asChild>
              <Link href="/onboarding">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(program => (
            <Card key={program.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{program.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {getPhaseLabel(program.phase)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        Cycle {program.cycle_number}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(program.status)}`} />
                    <span className="text-xs text-gray-600 capitalize">{program.status}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{calculateProgress(program)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(program)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>Started</span>
                    </div>
                    <div className="font-medium">
                      {formatDate(program.started_at)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>Workouts</span>
                    </div>
                    <div className="font-medium">
                      {program.workouts?.completed || 0} / {program.workouts?.total || 0}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/program/${program.id}`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  
                  {program.status === 'active' && (
                    <Button 
                      asChild 
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/workout/start?program=${program.id}`}>
                        <Play className="w-3 h-3 mr-1" />
                        Start Workout
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DAY 4 Achievement Badge */}
      {programs.length > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  🎉 DAY 4 Complete: Advanced Program Generation
                </h3>
                <p className="text-sm text-gray-600">
                  Your programs now feature 5-week cycles, progressive overload, deload weeks, 
                  and phase-based progression following the Daniel Vadel methodology.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}