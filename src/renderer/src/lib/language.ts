import { extractLocaleFromNavigator, type Locale, setLocale, toLocale } from '../paraglide/runtime'
import { APP_LANGUAGE_OPTIONS, type AppLanguage } from '../types'

export function isAppLanguage(value: unknown): value is AppLanguage {
  return APP_LANGUAGE_OPTIONS.includes(value as AppLanguage)
}

export function resolveLocalePreference(language: AppLanguage): Locale {
  if (language !== 'system') return language
  return extractLocaleFromNavigator() ?? 'zh-CN'
}

export function applyLanguage(language: AppLanguage): Locale {
  const locale = resolveLocalePreference(language)
  setLocale(locale, { reload: false })
  document.documentElement.lang = locale
  return locale
}

export function normalizeStoredLanguage(value: unknown): AppLanguage {
  if (value === 'system') return 'system'
  return toLocale(value) ?? 'system'
}
