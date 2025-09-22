// This file configures the initialization of Sentry on the browser/client side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { config } from './src/lib/config'

Sentry.init({
  dsn: config.analytics.sentryDsn,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: config.env.isProduction ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Set up automatic instrumentation
  integrations: [
    Sentry.replayIntegration({
      // Capture replay for errors and performance issues
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Environment configuration
  environment: config.env.isProduction ? 'production' : 'development',
  
  // Release tracking
  release: process.env.npm_package_version,
  
  // Filter out development errors
  beforeSend(event, hint) {
    // Don't send events in development
    if (config.env.isDevelopment) {
      console.log('Sentry event (development):', event)
      return null
    }
    
    // Filter out common non-critical errors
    const error = hint.originalException
    if (error instanceof Error) {
      // Filter out network errors that are expected
      if (error.message.includes('Network request failed')) {
        return null
      }
      
      // Filter out browser extension errors
      if (error.stack?.includes('extension://')) {
        return null
      }
    }
    
    return event
  },
  
  // Additional configuration
  debug: config.env.isDevelopment,
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
      app: config.app.name,
    },
  },
})