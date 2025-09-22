#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the Next.js production bundle and provides insights
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Starting bundle analysis...\n')

// Clean previous builds
console.log('🧹 Cleaning previous builds...')
try {
  execSync('rm -rf .next', { stdio: 'inherit' })
  console.log('✅ Cleaned .next directory\n')
} catch (error) {
  console.log('⚠️  No previous build to clean\n')
}

// Build with analyzer
console.log('🏗️  Building production bundle with analyzer...')
try {
  execSync('npm run build:analyze', { stdio: 'inherit' })
  console.log('✅ Build completed successfully\n')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Check bundle sizes
console.log('📊 Analyzing bundle sizes...')

const buildManifest = path.join('.next', 'build-manifest.json')
if (fs.existsSync(buildManifest)) {
  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
  
  console.log('\n📦 Bundle Information:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Analyze pages
  const pages = manifest.pages || {}
  Object.entries(pages).forEach(([page, files]) => {
    const totalSize = files.reduce((acc, file) => {
      const filePath = path.join('.next', 'static', file)
      if (fs.existsSync(filePath)) {
        return acc + fs.statSync(filePath).size
      }
      return acc
    }, 0)
    
    if (totalSize > 0) {
      console.log(`📄 ${page}: ${(totalSize / 1024).toFixed(2)} KB`)
    }
  })
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Performance recommendations
console.log('💡 Performance Recommendations:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('• Monitor Core Web Vitals in production')
console.log('• Use next/image for all images')
console.log('• Implement code splitting for large components')
console.log('• Consider lazy loading for non-critical components')
console.log('• Optimize fonts with next/font')
console.log('• Use dynamic imports for heavy dependencies')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('✅ Bundle analysis completed!')
console.log('🌐 Open the generated report in your browser to see detailed analysis')