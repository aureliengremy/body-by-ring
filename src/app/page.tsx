'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function handleAuth() {
      if (loading) return

      if (!user) {
        router.push('/auth')
        return
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('experience_level, full_name')
        .eq('id', user.id)
        .single()

      if (!profile?.experience_level || !profile?.full_name) {
        // User needs onboarding
        router.push('/onboarding')
      } else {
        // User can go to dashboard
        router.push('/dashboard')
      }

      setChecking(false)
    }

    handleAuth()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Body by Rings...</p>
        </div>
      </div>
    )
  }

  // Fallback landing page (should rarely be seen due to redirects above)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Body by Rings
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Professional calisthenics training with tendon-safe progressions
        </p>
        <Button 
          onClick={() => router.push('/auth')}
          size="lg"
          className="w-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}
