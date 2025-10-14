'use client'

import { useLocale } from '@/lib/i18n'
import { locales, Locale } from '@/lib/i18n/types'
import { usePathname } from '@/lib/i18n/navigation'
import { useRouter as useNextRouter } from 'next/navigation'
import { Button } from './ui/button'

export function LanguageSwitcher() {
  const currentLocale = useLocale()
  const pathname = usePathname()
  const router = useNextRouter()

  const switchLocale = (newLocale: Locale) => {
    // Don't switch if already on this locale
    if (newLocale === currentLocale) return

    // Build new path with locale prefix (all locales have prefix)
    const newPath = `/${newLocale}${pathname}`

    // Navigate to new path
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={currentLocale === locale ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale(locale)}
          className="px-3 py-1 text-xs"
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
