'use client'

import React, { ComponentProps, forwardRef } from 'react'
import NextLink from 'next/link'
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation'
import { useLocale } from './hooks'
import { defaultLocale } from './types'

/**
 * Custom Link component that automatically prepends locale to href
 * Works exactly like next/link but locale-aware
 */
export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
  function Link({ href, ...props }, ref) {
    const locale = useLocale()

    // Convert href to string if it's an object
    const hrefString = typeof href === 'string' ? href : href.pathname || '/'

    // Don't add locale prefix for external links or anchors
    if (hrefString.startsWith('http') || hrefString.startsWith('#')) {
      return <NextLink ref={ref} href={href} {...props} />
    }

    // Add locale prefix only for non-default locales
    const localizedHref = locale === defaultLocale
      ? hrefString
      : `/${locale}${hrefString}`

    return <NextLink ref={ref} href={localizedHref} {...props} />
  }
)

/**
 * Custom useRouter hook that provides locale-aware navigation
 * Works like next/navigation useRouter but with locale support
 */
export function useRouter() {
  const router = useNextRouter()
  const locale = useLocale()

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      const localizedHref = href.startsWith('http') || href.startsWith('#')
        ? href
        : locale === defaultLocale
        ? href
        : `/${locale}${href}`

      return router.push(localizedHref, options)
    },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
      const localizedHref = href.startsWith('http') || href.startsWith('#')
        ? href
        : locale === defaultLocale
        ? href
        : `/${locale}${href}`

      return router.replace(localizedHref, options)
    },
  }
}

/**
 * Custom usePathname hook that returns pathname without locale prefix
 */
export function usePathname() {
  const pathname = useNextPathname()
  const locale = useLocale()

  // Remove locale prefix if present (all locales have prefix now)
  if (pathname.startsWith(`/${locale}`)) {
    return pathname.slice(`/${locale}`.length) || '/'
  }

  return pathname
}
