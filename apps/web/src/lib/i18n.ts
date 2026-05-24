import { deLocalizeHref, getLocale, localizeHref, setLocale } from '../paraglide/runtime'

export const APP_LOCALES = ['en', 'zh'] as const
export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'

export function isAppLocale(value: unknown): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale)
}

export function getCurrentLocale(): AppLocale {
  const locale = getLocale()
  return isAppLocale(locale) ? locale : DEFAULT_LOCALE
}

export function getLocalizedPath(path: string, locale: AppLocale = getCurrentLocale()): string {
  return localizeHref(deLocalizeHref(path), { locale })
}

export function persistLocale(locale: AppLocale): void {
  setLocale(locale, { reload: false })
}
