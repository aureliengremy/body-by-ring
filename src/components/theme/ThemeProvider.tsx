'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useReducedMotion, useHighContrastMode } from '@/components/accessibility/SkipNavigation'

type Theme = 'light' | 'dark' | 'system'
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange'

interface ThemeContextType {
  theme: Theme
  colorScheme: ColorScheme
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  isDark: boolean
  reducedMotion: boolean
  highContrast: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  defaultColorScheme?: ColorScheme
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  defaultColorScheme = 'blue'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(defaultColorScheme)
  const [isDark, setIsDark] = useState(false)
  
  const reducedMotion = useReducedMotion()
  const highContrast = useHighContrastMode()

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme
    
    if (savedTheme) setTheme(savedTheme)
    if (savedColorScheme) setColorScheme(savedColorScheme)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark')
    
    // Handle theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      setIsDark(systemTheme === 'dark')
    } else {
      root.classList.add(theme)
      setIsDark(theme === 'dark')
    }

    // Handle color scheme
    root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange')
    root.classList.add(`scheme-${colorScheme}`)
    
    // Handle accessibility preferences
    if (reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Save preferences
    localStorage.setItem('theme', theme)
    localStorage.setItem('colorScheme', colorScheme)
  }, [theme, colorScheme, reducedMotion, highContrast])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const handleSetColorScheme = (newScheme: ColorScheme) => {
    setColorScheme(newScheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        setTheme: handleSetTheme,
        setColorScheme: handleSetColorScheme,
        isDark,
        reducedMotion,
        highContrast
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Color scheme variables for CSS
export const COLOR_SCHEMES = {
  blue: {
    primary: 'rgb(37 99 235)', // blue-600
    primaryForeground: 'rgb(255 255 255)',
    accent: 'rgb(59 130 246)', // blue-500
    accentForeground: 'rgb(255 255 255)',
  },
  green: {
    primary: 'rgb(22 163 74)', // green-600
    primaryForeground: 'rgb(255 255 255)',
    accent: 'rgb(34 197 94)', // green-500
    accentForeground: 'rgb(255 255 255)',
  },
  purple: {
    primary: 'rgb(147 51 234)', // purple-600
    primaryForeground: 'rgb(255 255 255)',
    accent: 'rgb(168 85 247)', // purple-500
    accentForeground: 'rgb(255 255 255)',
  },
  orange: {
    primary: 'rgb(234 88 12)', // orange-600
    primaryForeground: 'rgb(255 255 255)',
    accent: 'rgb(249 115 22)', // orange-500
    accentForeground: 'rgb(255 255 255)',
  },
} as const