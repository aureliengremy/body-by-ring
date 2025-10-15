'use client'

/**
 * Analytics & Monitoring Integration
 * Combines Vercel Analytics, Plausible, and Sentry for comprehensive tracking
 */

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Plausible from 'plausible-tracker'
import * as Sentry from '@sentry/nextjs'
import { config } from './config'

// Initialize Plausible
const plausible = Plausible({
  domain: config.analytics.plausibleDomain || 'body-by-rings.com',
  trackLocalhost: config.env.isDevelopment,
  apiHost: 'https://plausible.io',
})

// Initialize Sentry
if (config.analytics.sentryDsn && config.env.isProduction) {
  Sentry.init({
    dsn: config.analytics.sentryDsn,
    environment: config.env.isProduction ? 'production' : 'development',
    tracesSampleRate: 0.1,
    debug: config.env.isDevelopment,
    beforeSend(event) {
      // Filter out development errors
      if (config.env.isDevelopment) {
        return null
      }
      return event
    },
  })
}

// Analytics event types
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  properties?: Record<string, string | number | boolean>
}

// Workout-specific events
export interface WorkoutEvent {
  workoutId: string
  exerciseId?: string
  duration?: number
  rpe?: number
  sets?: number
  reps?: number
}

// User events
export interface UserEvent {
  userId: string
  action: 'signup' | 'login' | 'logout' | 'profile_update'
  properties?: Record<string, string | number | boolean>
}

// Analytics service
export class AnalyticsService {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = config.features.enableAnalytics && config.env.isProduction
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, string | number | boolean>) {
    if (!this.isEnabled) return

    plausible.trackPageview({
      url: page,
      ...properties,
    })
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return

    plausible.trackEvent(event.action, {
      props: {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.properties,
      },
    })
  }

  // Track workout events
  trackWorkout(event: WorkoutEvent & { action: string }) {
    if (!this.isEnabled) return

    this.trackEvent({
      action: event.action,
      category: 'workout',
      properties: {
        workoutId: event.workoutId,
        exerciseId: event.exerciseId,
        duration: event.duration,
        rpe: event.rpe,
        sets: event.sets,
        reps: event.reps,
      },
    })
  }

  // Track user events
  trackUser(event: UserEvent) {
    if (!this.isEnabled) return

    this.trackEvent({
      action: event.action,
      category: 'user',
      properties: {
        userId: event.userId,
        ...event.properties,
      },
    })

    // Set user context for Sentry
    Sentry.setUser({
      id: event.userId,
    })
  }

  // Track errors
  trackError(error: Error, context?: Record<string, string | number | boolean | undefined>) {
    if (!this.isEnabled) return

    console.error('Analytics Error:', error)

    Sentry.captureException(error, {
      tags: {
        component: 'analytics',
      },
      extra: context,
    })
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    if (!this.isEnabled) return

    this.trackEvent({
      action: 'performance',
      category: 'metrics',
      label: metric,
      value,
      properties: {
        unit,
      },
    })
  }

  // Track feature usage
  trackFeature(feature: string, properties?: Record<string, string | number | boolean>) {
    if (!this.isEnabled) return

    this.trackEvent({
      action: 'feature_used',
      category: 'features',
      label: feature,
      properties,
    })
  }
}

// Singleton instance
export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  useEffect(() => {
    // Track page views automatically
    const handleRouteChange = () => {
      analytics.trackPageView(window.location.pathname)
    }

    // Track initial page view
    handleRouteChange()

    // Listen for route changes (for client-side navigation)
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return analytics
}

// Analytics Provider Component
interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useAnalytics()

  return (
    <>
      {children}
      {config.features.enableAnalytics && config.env.isProduction && (
        <Analytics />
      )}
    </>
  )
}

// Convenience hooks for specific tracking
export function useWorkoutAnalytics() {
  return {
    trackWorkoutStart: (workoutId: string) => {
      analytics.trackWorkout({
        action: 'workout_started',
        workoutId,
      })
    },
    trackWorkoutComplete: (workoutId: string, duration: number) => {
      analytics.trackWorkout({
        action: 'workout_completed',
        workoutId,
        duration,
      })
    },
    trackExerciseComplete: (workoutId: string, exerciseId: string, sets: number, reps: number, rpe: number) => {
      analytics.trackWorkout({
        action: 'exercise_completed',
        workoutId,
        exerciseId,
        sets,
        reps,
        rpe,
      })
    },
  }
}

export function useUserAnalytics() {
  return {
    trackSignup: (userId: string) => {
      analytics.trackUser({
        userId,
        action: 'signup',
      })
    },
    trackLogin: (userId: string) => {
      analytics.trackUser({
        userId,
        action: 'login',
      })
    },
    trackLogout: (userId: string) => {
      analytics.trackUser({
        userId,
        action: 'logout',
      })
    },
  }
}

// Export analytics instance as default
export default analytics