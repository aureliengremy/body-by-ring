'use client'

import { cn } from '@/lib/utils'
import { Loader2, Dumbbell, Heart } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'pulse' | 'branded'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  className 
}: LoadingProps) {
  if (variant === 'branded') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="relative">
          <div className="animate-spin">
            <Dumbbell className={cn(sizeClasses[size], 'text-blue-600')} />
          </div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 text-red-500 animate-pulse" />
        </div>
        {text && (
          <p className={cn('text-gray-600 animate-pulse', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center space-x-2', className)}>
        <div className="flex space-x-1">
          <div className={cn('rounded-full bg-blue-600 animate-pulse', sizeClasses[size])} />
          <div className={cn('rounded-full bg-blue-600 animate-pulse delay-75', sizeClasses[size])} />
          <div className={cn('rounded-full bg-blue-600 animate-pulse delay-150', sizeClasses[size])} />
        </div>
        {text && (
          <span className={cn('text-gray-600', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && (
        <span className={cn('text-gray-600', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

// Skeleton components for content loading
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function ExerciseCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}