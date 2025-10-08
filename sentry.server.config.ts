// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { config } from './src/lib/config'

Sentry.init({
  dsn: config.analytics.sentryDsn,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: config.env.isProduction ? 0.1 : 1.0,
  
  // Environment configuration
  environment: config.env.isProduction ? 'production' : 'development',
  
  // Release tracking
  release: process.env.npm_package_version,
  
  // Filter out development errors
  beforeSend(event, _hint) {
    // Don't send events in development
    if (config.env.isDevelopment) {
      console.log('Sentry event (server):', event)
      return null
    }
    
    return event
  },
  
  // Additional configuration
  debug: config.env.isDevelopment,
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'server',
      app: config.app.name,
    },
  },
})