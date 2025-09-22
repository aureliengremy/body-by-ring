#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the production deployment setup is correct
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying deployment configuration...\n')

const checks = []

// Check environment files
checks.push({
  name: 'Environment Configuration',
  check: () => {
    const envExample = path.join('.env.example')
    const envLocal = path.join('.env.local')
    
    if (!fs.existsSync(envExample)) {
      return { success: false, message: '.env.example file missing' }
    }
    
    if (!fs.existsSync(envLocal)) {
      return { success: false, message: '.env.local file missing (create from .env.example)' }
    }
    
    return { success: true, message: 'Environment files present' }
  }
})

// Check Vercel configuration
checks.push({
  name: 'Vercel Configuration',
  check: () => {
    const vercelConfig = path.join('vercel.json')
    
    if (!fs.existsSync(vercelConfig)) {
      return { success: false, message: 'vercel.json file missing' }
    }
    
    const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'))
    if (!config.env || !config.framework) {
      return { success: false, message: 'Vercel configuration incomplete' }
    }
    
    return { success: true, message: 'Vercel configuration valid' }
  }
})

// Check Next.js configuration
checks.push({
  name: 'Next.js Configuration',
  check: () => {
    const nextConfig = path.join('next.config.js')
    
    if (!fs.existsSync(nextConfig)) {
      return { success: false, message: 'next.config.js file missing' }
    }
    
    return { success: true, message: 'Next.js configuration present' }
  }
})

// Check GitHub Actions
checks.push({
  name: 'CI/CD Pipeline',
  check: () => {
    const ciConfig = path.join('.github', 'workflows', 'ci.yml')
    
    if (!fs.existsSync(ciConfig)) {
      return { success: false, message: 'GitHub Actions CI configuration missing' }
    }
    
    return { success: true, message: 'CI/CD pipeline configured' }
  }
})

// Check analytics configuration
checks.push({
  name: 'Analytics Configuration',
  check: () => {
    const analyticsFile = path.join('src', 'lib', 'analytics.tsx')
    const sentryClient = path.join('sentry.client.config.ts')
    const sentryServer = path.join('sentry.server.config.ts')
    
    if (!fs.existsSync(analyticsFile)) {
      return { success: false, message: 'Analytics service missing' }
    }
    
    if (!fs.existsSync(sentryClient) || !fs.existsSync(sentryServer)) {
      return { success: false, message: 'Sentry configuration incomplete' }
    }
    
    return { success: true, message: 'Analytics and monitoring configured' }
  }
})

// Check bundle optimization
checks.push({
  name: 'Bundle Optimization',
  check: () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    if (!packageJson.scripts['build:analyze'] || !packageJson.scripts['analyze:bundle']) {
      return { success: false, message: 'Bundle analysis scripts missing' }
    }
    
    if (!packageJson.devDependencies['@next/bundle-analyzer']) {
      return { success: false, message: 'Bundle analyzer dependency missing' }
    }
    
    return { success: true, message: 'Bundle optimization tools configured' }
  }
})

// Run all checks
console.log('Running deployment verification checks...\n')

let allPassed = true
checks.forEach(({ name, check }) => {
  const result = check()
  const status = result.success ? '✅' : '❌'
  console.log(`${status} ${name}: ${result.message}`)
  
  if (!result.success) {
    allPassed = false
  }
})

console.log('\n' + '━'.repeat(50))

if (allPassed) {
  console.log('🎉 All deployment checks passed!')
  console.log('🚀 Ready for production deployment')
  console.log('\nNext steps:')
  console.log('1. npm run build:analyze - Analyze bundle')
  console.log('2. npm run deploy:preview - Deploy preview')
  console.log('3. npm run deploy:production - Deploy to production')
} else {
  console.log('⚠️  Some deployment checks failed')
  console.log('Please fix the issues above before deploying')
  process.exit(1)
}

console.log('━'.repeat(50))