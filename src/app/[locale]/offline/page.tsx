'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Zap, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Automatically redirect when connection is restored
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router])

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/dashboard')
    } else {
      // Force refresh to check connection
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Connection Status */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isOnline ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            <WifiOff className={`w-8 h-8 ${isOnline ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-600">
            {isOnline 
              ? 'Redirecting you back to the app...'
              : 'No internet connection detected. Some features may not be available.'
            }
          </p>
        </div>

        {/* Offline Features Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Available Offline
            </CardTitle>
            <CardDescription>
              You can still use these features while offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">View cached workout programs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Log workout sets (will sync later)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Browse exercise library</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">View profile settings</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full"
            disabled={isOnline}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? 'Connecting...' : 'Try Again'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            <Heart className="w-4 h-4 mr-2" />
            Continue Offline
          </Button>
        </div>

        {/* Tips */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-2">💡 Tip:</p>
              <p>
                Any workouts you log while offline will automatically sync 
                when your connection is restored. Your progress is never lost!
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}