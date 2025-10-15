'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerRegistrationProps {
  children?: React.ReactNode
}

export function ServiceWorkerRegistration({ children }: ServiceWorkerRegistrationProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Sync offline data when connection is restored
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_DATA' })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      console.log('[PWA] Registering service worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      setRegistration(registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available!')
              setUpdateAvailable(true)
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[PWA] Message from service worker:', event.data)
      })

      console.log('[PWA] Service worker registered successfully')
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
    }
  }

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const handleInstallPrompt = () => {
    // This will be enhanced with install prompt logic
    console.log('[PWA] Install prompt requested')
  }

  return (
    <>
      {children}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            You&apos;re offline. Changes will sync when connection is restored.
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Update Available</h4>
              <p className="text-sm opacity-90">A new version of Body by Rings is ready!</p>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Prompt (can be enhanced later) */}
      <div className="hidden">
        <button onClick={handleInstallPrompt}>
          Install App
        </button>
      </div>
    </>
  )
}