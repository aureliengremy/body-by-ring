import { ReactNode } from 'react'
import { I18nProvider, Locale, locales } from '@/lib/i18n'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { AnalyticsProvider } from '@/lib/analytics'
import { notFound } from 'next/navigation'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Await params (Next.js 15 requirement)
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return (
    <I18nProvider locale={locale as Locale}>
      <AuthProvider>
        <AnalyticsProvider>
          <AppLayout>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </AppLayout>
        </AnalyticsProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
