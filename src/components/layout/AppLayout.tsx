'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { MainNav } from '@/components/navigation/MainNav'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

// Pages that shouldn't show navigation
const NO_NAV_PAGES = ['/auth', '/onboarding', '/']

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const showNavigation = user && !NO_NAV_PAGES.includes(pathname)

  // Handle responsive navigation - show mobile nav on small screens
  useEffect(() => {
    const handleResize = () => {
      // Add mobile-specific logic if needed
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Body by Rings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      {showNavigation && <MainNav variant="header" />}
      
      {/* Main Content */}
      <main className={showNavigation ? 'pb-20 md:pb-0' : ''}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showNavigation && (
        <div className="md:hidden">
          <MainNav variant="mobile" />
        </div>
      )}
    </div>
  )
}

// Hook for consistent page layout
export function usePageLayout() {
  const router = useRouter()
  
  const navigateTo = (path: string) => {
    router.push(path)
  }
  
  const goBack = () => {
    router.back()
  }
  
  return {
    navigateTo,
    goBack
  }
}