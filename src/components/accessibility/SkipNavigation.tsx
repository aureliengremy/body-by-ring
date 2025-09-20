'use client'

import { cn } from '@/lib/utils'

interface SkipNavigationProps {
  className?: string
}

export function SkipNavigation({ className }: SkipNavigationProps) {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      <a
        href="#main-content"
        className={cn(
          'fixed top-4 left-4 z-[9999] px-4 py-2 text-sm font-medium',
          'bg-blue-600 text-white rounded-md shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'transition-all duration-200 ease-out',
          'transform translate-y-0 opacity-100'
        )}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className={cn(
          'fixed top-4 left-32 z-[9999] px-4 py-2 text-sm font-medium',
          'bg-blue-600 text-white rounded-md shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'transition-all duration-200 ease-out',
          'transform translate-y-0 opacity-100'
        )}
      >
        Skip to navigation
      </a>
    </div>
  )
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  const makeAccessible = (element: HTMLElement | null) => {
    if (!element) return

    // Add ARIA attributes
    if (!element.getAttribute('role')) {
      element.setAttribute('role', 'button')
    }
    
    if (!element.getAttribute('tabIndex')) {
      element.setAttribute('tabIndex', '0')
    }

    // Add keyboard support
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        element.click()
      }
    })
  }

  return { handleKeyPress, makeAccessible }
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export function focusManagement() {
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  const restoreFocus = (previousActiveElement: Element | null) => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus()
    }
  }

  return { trapFocus, restoreFocus }
}

// High contrast mode detection
export function useHighContrastMode() {
  const isHighContrast = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-contrast: high)').matches

  return isHighContrast
}

// Reduced motion detection
export function useReducedMotion() {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return prefersReducedMotion
}