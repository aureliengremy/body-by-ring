'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'

interface NavItem {
  label: string
  href: string
  icon: string
  description?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '🏠',
    description: 'Overview and quick actions'
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: '🎯',
    description: 'Training programs and cycles'
  },
  {
    label: 'My Workouts',
    href: '/workouts',
    icon: '💪',
    description: 'Training sessions and progress'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: '📊',
    description: 'Progress tracking and insights'
  },
  {
    label: 'Exercise Library',
    href: '/exercises',
    icon: '📚',
    description: 'Browse all movements'
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: '⚙️',
    description: 'Settings and preferences'
  }
]

interface MainNavProps {
  variant?: 'header' | 'sidebar' | 'mobile'
}

export function MainNav({ variant = 'header' }: MainNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  if (!user) return null

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (variant === 'header') {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              onClick={() => router.push('/dashboard')}
              className="flex items-center cursor-pointer"
            >
              <span className="text-2xl font-bold text-blue-600">Body by Rings</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {NAV_ITEMS.map(item => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut()
                  router.push('/auth')
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'sidebar') {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
          <nav className="space-y-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`p-3 rounded-lg text-center transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// Breadcrumb component for secondary navigation
interface BreadcrumbProps {
  items: { label: string; href?: string }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter()

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">→</span>}
          {item.href ? (
            <button
              onClick={() => router.push(item.href!)}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Page header component
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: { label: string; href?: string }[]
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}