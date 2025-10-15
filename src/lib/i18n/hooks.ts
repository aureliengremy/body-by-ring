'use client'

import { useCallback } from 'react'
import { useI18nContext } from './provider'
import { TranslateFn, TranslationValue, Translations } from './types'

/**
 * Hook to get the current locale
 * @returns The current locale (fr or en)
 */
export function useLocale() {
  const { locale } = useI18nContext()
  return locale
}

/**
 * Hook to get translations for a specific namespace
 * @param namespace - The namespace to get translations for (e.g., 'common', 'workout')
 * @returns Translation function that accepts a key and optional parameters
 *
 * @example
 * const t = useTranslations('workout')
 * t('title') // "Séance" (FR) or "Workout" (EN)
 * t('setNumber', { number: 3 }) // "Série 3" (FR) or "Set 3" (EN)
 */
export function useTranslations(namespace?: string): TranslateFn {
  const { translations } = useI18nContext()

  const translate = useCallback<TranslateFn>(
    (key: string, params?: Record<string, string | number>) => {
      // Navigate through the translations object
      let value: TranslationValue | Translations | undefined

      // If namespace is provided, start from that namespace
      if (namespace) {
        const namespaceTranslations = translations[namespace]
        if (typeof namespaceTranslations === 'object' && !isFunction(namespaceTranslations)) {
          value = (namespaceTranslations as Translations)[key]
        }
      } else {
        // Otherwise, treat the key as a full path (e.g., "common.loading")
        const keys = key.split('.')
        value = keys.reduce<TranslationValue | Translations | undefined>(
          (acc, k) => {
            if (acc && typeof acc === 'object' && !isFunction(acc)) {
              return (acc as Translations)[k]
            }
            return undefined
          },
          translations
        )
      }

      // If value is a function, call it with params
      if (typeof value === 'function') {
        return value(params || {})
      }

      // If value is a string, return it
      if (typeof value === 'string') {
        return value
      }

      // Fallback to key if translation not found
      console.warn(`Translation not found: ${namespace ? `${namespace}.${key}` : key}`)
      return namespace ? `${namespace}.${key}` : key
    },
    [translations, namespace]
  )

  return translate
}

// Helper to check if value is a function
function isFunction(value: unknown): value is (params: Record<string, string | number>) => string {
  return typeof value === 'function'
}
