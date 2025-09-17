'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Dumbbell, 
  BarChart3, 
  Users, 
  Search, 
  AlertCircle,
  Plus,
  Play,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react'

interface EmptyStateProps {
  variant?: 'default' | 'workouts' | 'analytics' | 'exercises' | 'search' | 'error' | 'programs'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  icon?: React.ReactNode
}

const variantConfig = {
  default: {
    icon: AlertCircle,
    title: 'No Data Available',
    description: 'There\'s nothing to show here yet.',
    actionLabel: 'Get Started'
  },
  workouts: {
    icon: Dumbbell,
    title: 'No Workouts Yet',
    description: 'Start your fitness journey by creating your first workout session.',
    actionLabel: 'Start First Workout'
  },
  analytics: {
    icon: BarChart3,
    title: 'No Progress Data',
    description: 'Complete some workouts to see your progress analytics and trends.',
    actionLabel: 'View Workouts'
  },
  exercises: {
    icon: BookOpen,
    title: 'No Exercises Found',
    description: 'Try adjusting your filters or browse the complete exercise library.',
    actionLabel: 'Clear Filters'
  },
  search: {
    icon: Search,
    title: 'No Results Found',
    description: 'We couldn\'t find anything matching your search. Try different keywords.',
    actionLabel: 'Clear Search'
  },
  error: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    description: 'We encountered an error loading this content. Please try again.',
    actionLabel: 'Retry'
  },
  programs: {
    icon: Target,
    title: 'No Programs Available', 
    description: 'Create or generate a training program to get started with your fitness journey.',
    actionLabel: 'Generate Program'
  }
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const IconComponent = icon ? () => icon : config.icon

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
        
        {/* Icon */}
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-6',
          variant === 'error' ? 'bg-red-100' : 'bg-gray-100'
        )}>
          <IconComponent className={cn(
            'w-8 h-8',
            variant === 'error' ? 'text-red-500' : 'text-gray-500'
          )} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title || config.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 max-w-sm">
          {description || config.description}
        </p>

        {/* Action Button */}
        {onAction && (
          <Button 
            onClick={onAction}
            variant={variant === 'error' ? 'outline' : 'default'}
            className="min-w-32"
          >
            {actionLabel || config.actionLabel}
          </Button>
        )}

      </CardContent>
    </Card>
  )
}

// Specialized empty states for common scenarios
export function NoWorkoutsEmpty({ onStartWorkout }: { onStartWorkout?: () => void }) {
  return (
    <EmptyState
      variant="workouts"
      title="Ready to Start Training?"
      description="Begin your calisthenics journey with professionally designed workout programs."
      actionLabel="Start Your First Workout"
      onAction={onStartWorkout}
      icon={<Play className="w-8 h-8" />}
    />
  )
}

export function NoAnalyticsEmpty({ onViewWorkouts }: { onViewWorkouts?: () => void }) {
  return (
    <EmptyState
      variant="analytics"
      title="Track Your Progress"
      description="Complete a few workouts to unlock detailed analytics and see your fitness journey unfold."
      actionLabel="Browse Workouts"
      onAction={onViewWorkouts}
      icon={<TrendingUp className="w-8 h-8" />}
    />
  )
}

export function NoExercisesEmpty({ onBrowseAll }: { onBrowseAll?: () => void }) {
  return (
    <EmptyState
      variant="exercises"
      title="Explore Exercise Library"
      description="Discover hundreds of calisthenics exercises with detailed instructions and progressions."
      actionLabel="Browse All Exercises"
      onAction={onBrowseAll}
      icon={<BookOpen className="w-8 h-8" />}
    />
  )
}

export function NoProgramsEmpty({ onGenerateProgram }: { onGenerateProgram?: () => void }) {
  return (
    <EmptyState
      variant="programs"
      title="Create Your Program"
      description="Generate a personalized training program based on your experience level and goals."
      actionLabel="Generate Program"
      onAction={onGenerateProgram}
      icon={<Plus className="w-8 h-8" />}
    />
  )
}

export function SearchEmpty({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No Results Found"
      description="Try using different keywords or check your spelling."
      actionLabel="Clear Search"
      onAction={onClearSearch}
    />
  )
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Oops! Something Went Wrong"
      description="We're having trouble loading this content. Please check your connection and try again."
      actionLabel="Try Again"
      onAction={onRetry}
    />
  )
}