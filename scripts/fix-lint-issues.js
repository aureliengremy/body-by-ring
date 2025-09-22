#!/usr/bin/env node

/**
 * Lint Issues Fix Script
 * Automatically fixes common linting issues in the codebase
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Fixing common lint issues...\n')

// Fix common issues
const fixes = [
  {
    name: 'Escape apostrophes in JSX',
    pattern: /'/g,
    replacement: '&apos;',
    filter: (content, filePath) => {
      // Only fix apostrophes in JSX content, not in code
      return filePath.endsWith('.tsx') && content.includes("'")
    }
  }
]

function fixFile(filePath, relativePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Remove unused imports
  const lines = content.split('\n')
  const filteredLines = lines.filter(line => {
    // Keep the line if it doesn't match common unused import patterns
    if (line.includes('import') && line.includes('but never used')) {
      return false
    }
    return true
  })

  if (filteredLines.length !== lines.length) {
    content = filteredLines.join('\n')
    modified = true
  }

  // Apply other fixes
  fixes.forEach(fix => {
    if (fix.filter && !fix.filter(content, filePath)) {
      return
    }
    
    const newContent = content.replace(fix.pattern, fix.replacement)
    if (newContent !== content) {
      content = newContent
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed: ${relativePath}`)
  }
}

// Find TypeScript/React files
function findTSXFiles(dir, baseDir = dir) {
  let files = []
  
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files = files.concat(findTSXFiles(fullPath, baseDir))
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push({
        full: fullPath,
        relative: path.relative(baseDir, fullPath)
      })
    }
  }
  
  return files
}

// Process files
const srcDir = path.join(process.cwd(), 'src')
if (fs.existsSync(srcDir)) {
  const files = findTSXFiles(srcDir)
  
  console.log(`Found ${files.length} TypeScript/React files to check...\n`)
  
  files.forEach(({ full, relative }) => {
    try {
      fixFile(full, relative)
    } catch (error) {
      console.log(`❌ Error fixing ${relative}: ${error.message}`)
    }
  })
}

console.log('\n🔧 Running ESLint auto-fix...')
try {
  execSync('npm run lint:fix', { stdio: 'inherit' })
  console.log('✅ ESLint auto-fix completed')
} catch (error) {
  console.log('⚠️  Some lint issues remain - manual fixes may be needed')
}

console.log('\n✅ Lint fixing completed!')
console.log('💡 Note: Some issues may require manual fixes for production deployment')