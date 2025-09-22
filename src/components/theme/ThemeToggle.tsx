'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: 'light', label: 'Mode Clair', icon: Sun },
    { key: 'dark', label: 'Mode Sombre', icon: Moon },
  ] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="focus-ring interactive-button"
          aria-label="Changer le thème"
        >
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Thème</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}