/**
 * Application Configuration
 * Centralized configuration management for environment variables
 */

// Validate required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const

// Check for missing required environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  )
}

export const config = {
  // App Information
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Body by Rings',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional calisthenics training with tendon-safe progressions',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://body-by-rings.vercel.app',
    version: process.env.npm_package_version || '1.0.0',
  },

  // Environment
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Analytics & Monitoring
  analytics: {
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    vercelAnalyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    sentryDsn: process.env.SENTRY_DSN,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // Feature Flags
  features: {
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // Security
  security: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://body-by-rings.vercel.app',
    timeout: 10000, // 10 seconds
  },

  // UI Configuration
  ui: {
    defaultTheme: 'system' as const,
    supportedThemes: ['light', 'dark', 'system'] as const,
    defaultLanguage: 'fr' as const,
    supportedLanguages: ['fr', 'en'] as const,
  },

  // Workout Configuration
  workout: {
    defaultRestTime: 90, // seconds
    maxRestTime: 300, // 5 minutes
    defaultRPERange: [6, 10] as const,
    maxWorkoutDuration: 180, // 3 hours in minutes
  },

  // Gamification Configuration
  gamification: {
    baseXP: 50,
    levelMultiplier: 1.5,
    maxLevel: 100,
    streakBonusMultiplier: 0.1,
  },
} as const

// Type-safe environment variable access
export type Config = typeof config

// Helper function to get configuration safely
export function getConfig(): Config {
  return config
}

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature]
}

// Helper to validate configuration in tests
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required Supabase configuration
  if (!config.supabase.url || !config.supabase.anonKey) {
    errors.push('Supabase configuration is incomplete')
  }

  // Validate URLs
  try {
    new URL(config.app.url)
  } catch {
    errors.push('Invalid app URL')
  }

  if (config.analytics.sentryDsn) {
    try {
      new URL(config.analytics.sentryDsn)
    } catch {
      errors.push('Invalid Sentry DSN')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export for use in other modules
export default config