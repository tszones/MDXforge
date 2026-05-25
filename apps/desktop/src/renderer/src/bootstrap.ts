import { applyAppFont, normalizeStoredFont } from './lib/font'
import { normalizeStoredLanguage } from './lib/language'
import { applyFumadocsTheme, isFumadocsThemeName } from './lib/theme'
import type { AppSettings } from './types'

const initialSettings = window.api.getInitialSettings() as Partial<AppSettings> | null

if (initialSettings) {
  const theme =
    typeof initialSettings.theme === 'string' && isFumadocsThemeName(initialSettings.theme)
      ? initialSettings.theme
      : 'purple'
  const colorMode = initialSettings.colorMode === 'light' ? 'light' : 'dark'
  const language = normalizeStoredLanguage(initialSettings.language)
  const font = normalizeStoredFont(initialSettings.font)

  applyFumadocsTheme(theme, colorMode)
  document.documentElement.lang = language === 'zh-CN' ? 'zh-CN' : 'en-US'
  applyAppFont(font)
}
