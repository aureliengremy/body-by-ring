import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, Locale } from './lib/i18n/types'

// Cookie name to store locale preference
const LOCALE_COOKIE = 'NEXT_LOCALE'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and PWA files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/icon') ||
    pathname.includes('/manifest') ||
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox-') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Extract locale from pathname and set cookie
    const locale = pathname.split('/')[1] as Locale
    const response = NextResponse.next()
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    })
    return response
  }

  // Get locale from cookie or browser Accept-Language header
  let locale = request.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined

  if (!locale) {
    // Parse Accept-Language header
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
      // Extract first language preference
      const browserLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
      // Check if browser language matches any of our supported locales
      locale = locales.find((l) => l === browserLang) || defaultLocale
    } else {
      locale = defaultLocale
    }
  }

  // Redirect to locale-prefixed path (ALL locales get a prefix)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  const response = NextResponse.redirect(url)
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  })
  return response
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
