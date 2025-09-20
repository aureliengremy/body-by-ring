'use client'

import { Moon, Sun, Monitor, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme()

  const themes = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ] as const

  const colorSchemes = [
    { key: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { key: 'green', label: 'Green', color: 'bg-green-500' },
    { key: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { key: 'orange', label: 'Orange', color: 'bg-orange-500' },
  ] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="focus-ring interactive-button"
          aria-label="Change theme and color scheme"
        >
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          {theme === 'system' && <Monitor className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {themes.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key)}
            className={`flex items-center gap-2 cursor-pointer ${
              theme === key ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {theme === key && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Color Scheme
        </DropdownMenuLabel>
        {colorSchemes.map(({ key, label, color }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setColorScheme(key)}
            className={`flex items-center gap-2 cursor-pointer ${
              colorScheme === key ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${color}`} />
            {label}
            {colorScheme === key && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}