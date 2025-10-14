'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Locale, Translations } from './types'
import { fr } from './locales/fr'
import { en } from './locales/en'

interface I18nContextValue {
  locale: Locale
  translations: Translations
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

interface I18nProviderProps {
  locale: Locale
  children: ReactNode
}

// Map of all available translations
const translationsMap: Record<Locale, Translations> = {
  fr,
  en,
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const translations = translationsMap[locale] || translationsMap.fr

  return (
    <I18nContext.Provider value={{ locale, translations }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider')
  }
  return context
}
