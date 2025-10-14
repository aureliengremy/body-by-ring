// Types for i18n system
export type Locale = 'fr' | 'en'

export const locales: readonly Locale[] = ['fr', 'en'] as const
export const defaultLocale: Locale = 'fr'

// Translation value can be string or function for variables
export type TranslationValue = string | ((params: Record<string, string | number>) => string)

// Nested translation structure
export type Translations = {
  [key: string]: TranslationValue | Translations
}

// Type-safe translation function
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string

// Locale configuration
export interface LocaleConfig {
  locale: Locale
  translations: Translations
}
