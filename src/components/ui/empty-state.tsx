'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n'
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

export function EmptyState({
  variant = 'default',
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon
}: EmptyStateProps) {
  const t = useTranslations('emptyState')

  const variantConfig = {
    default: {
      icon: AlertCircle,
      title: t('noDataAvailable'),
      description: t('nothingToShow'),
      actionLabel: t('getStarted')
    },
    workouts: {
      icon: Dumbbell,
      title: t('noWorkoutsYet'),
      description: t('startFitnessJourney'),
      actionLabel: t('startFirstWorkout')
    },
    analytics: {
      icon: BarChart3,
      title: t('noProgressData'),
      description: t('completeWorkoutsToSeeProgress'),
      actionLabel: t('viewWorkouts')
    },
    exercises: {
      icon: BookOpen,
      title: t('noExercisesFound'),
      description: t('adjustFilters'),
      actionLabel: t('clearFilters')
    },
    search: {
      icon: Search,
      title: t('noResultsFound'),
      description: t('tryDifferentKeywords'),
      actionLabel: t('clearSearch')
    },
    error: {
      icon: AlertCircle,
      title: t('somethingWentWrong'),
      description: t('errorLoadingContent'),
      actionLabel: t('retry')
    },
    programs: {
      icon: Target,
      title: t('noProgramsAvailable'),
      description: t('createTrainingProgram'),
      actionLabel: t('generateProgram')
    }
  }

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
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="workouts"
      title={t('readyToStartTraining')}
      description={t('beginJourney')}
      actionLabel={t('startYourFirstWorkout')}
      onAction={onStartWorkout}
      icon={<Play className="w-8 h-8" />}
    />
  )
}

export function NoAnalyticsEmpty({ onViewWorkouts }: { onViewWorkouts?: () => void }) {
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="analytics"
      title={t('trackYourProgress')}
      description={t('completeWorkoutsForAnalytics')}
      actionLabel={t('browseWorkouts')}
      onAction={onViewWorkouts}
      icon={<TrendingUp className="w-8 h-8" />}
    />
  )
}

export function NoExercisesEmpty({ onBrowseAll }: { onBrowseAll?: () => void }) {
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="exercises"
      title={t('exploreExerciseLibrary')}
      description={t('discoverExercises')}
      actionLabel={t('browseAllExercises')}
      onAction={onBrowseAll}
      icon={<BookOpen className="w-8 h-8" />}
    />
  )
}

export function NoProgramsEmpty({ onGenerateProgram }: { onGenerateProgram?: () => void }) {
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="programs"
      title={t('createYourProgram')}
      description={t('generatePersonalizedProgram')}
      actionLabel={t('generateProgram')}
      onAction={onGenerateProgram}
      icon={<Plus className="w-8 h-8" />}
    />
  )
}

export function SearchEmpty({ onClearSearch }: { onClearSearch?: () => void }) {
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="search"
      title={t('noResultsFound')}
      description={t('checkSpelling')}
      actionLabel={t('clearSearch')}
      onAction={onClearSearch}
    />
  )
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations('emptyState')
  return (
    <EmptyState
      variant="error"
      title={t('oopsSomethingWentWrong')}
      description={t('troubleLoading')}
      actionLabel={t('tryAgain')}
      onAction={onRetry}
    />
  )
}