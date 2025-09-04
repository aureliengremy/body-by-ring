'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [isWelcome, setIsWelcome] = useState(false)

  // Load user data
  useEffect(() => {
    async function loadData() {
      if (!user) return

      // Check for welcome parameter
      setIsWelcome(searchParams.get('welcome') === 'true')

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Load active program
      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setProgram(programData)
    }

    loadData()
  }, [user, searchParams])

  // Redirect to auth if not logged in
  if (!loading && !user) {
    router.push('/auth')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isWelcome ? 'Welcome to Body by Rings! 🎉' : 'Welcome back! 🚀'}
          </h1>
          <p className="text-gray-600">
            {profile?.full_name || user?.email}
            {profile?.experience_level && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {profile.experience_level}
              </span>
            )}
          </p>
        </div>

        {/* Welcome Message */}
        {isWelcome && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Your Program is Ready!
                </h2>
                <p className="text-gray-600 mb-4">
                  We've created a personalized training program based on your fitness level and goals. 
                  Your journey to calisthenics mastery starts now!
                </p>
                <Button onClick={() => setIsWelcome(false)}>
                  Let's Get Started! 💪
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🏋️ Current Program</CardTitle>
              <CardDescription>
                {program ? `${program.name} - Phase ${program.phase}` : 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {program ? (
                <>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Cycle {program.cycle_number}</p>
                    <p>• Started {new Date(program.started_at).toLocaleDateString()}</p>
                    <p>• Status: <span className="font-medium text-green-600">{program.status}</span></p>
                  </div>
                  <Button className="w-full">
                    Start Next Workout
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Ready to start your calisthenics journey!
                  </p>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => router.push('/onboarding')}
                  >
                    Create Program
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Progress</CardTitle>
              <CardDescription>Track your improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                No workouts completed yet. Let's get started!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Next Session</CardTitle>
              <CardDescription>Upcoming workout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Push Session 1 - Upper body foundations
              </p>
              <Button variant="outline" className="mt-4 w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-16"
              onClick={() => router.push('/workouts')}
            >
              📝 My Workouts
            </Button>
            <Button variant="outline" className="h-16">
              📈 View Progress
            </Button>
            <Button 
              variant="outline" 
              className="h-16"
              onClick={() => router.push('/exercises')}
            >
              🏃 Exercise Library
            </Button>
            <Button 
              variant="outline" 
              className="h-16"
              onClick={() => router.push('/profile')}
            >
              ⚙️ Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}