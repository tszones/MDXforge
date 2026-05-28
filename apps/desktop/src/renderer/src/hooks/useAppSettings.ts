import { useEffect, useState } from 'react'
import { applyAppFont, normalizeStoredFont } from '../lib/font'
import { applyLanguage, normalizeStoredLanguage } from '../lib/language'
import {
  applyFumadocsTheme,
  type ColorMode,
  type FumadocsThemeName,
  isFumadocsThemeName
} from '../lib/theme'
import type {
  AppFontName,
  AppLanguage,
  AppSettings,
  AskAiButtonAction,
  WorkbenchLayoutSettings
} from '../types'
import { defaultViewableDocumentExtensions } from '../types'

export function readInitialSettings(): Partial<AppSettings> {
  const settings = window.api.getInitialSettings()
  if (!settings || typeof settings !== 'object') return {}
  return settings as Partial<AppSettings>
}

export function useAppSettings(): {
  theme: FumadocsThemeName
  colorMode: ColorMode
  language: AppLanguage
  font: AppFontName
  viewableDocumentExtensions: string[]
  askAiButtonAction: AskAiButtonAction
  workbenchLayout?: WorkbenchLayoutSettings
  setTheme: (theme: FumadocsThemeName) => Promise<void>
  setColorMode: (mode: ColorMode) => Promise<void>
  setLanguage: (language: AppLanguage) => Promise<void>
  setFont: (font: AppFontName) => Promise<void>
  setViewableDocumentExtensions: (extensions: string[]) => Promise<void>
  setAskAiButtonAction: (action: AskAiButtonAction) => Promise<void>
  setWorkbenchLayout: (layout: WorkbenchLayoutSettings) => Promise<void>
} {
  const initialSettings = readInitialSettings()
  const [theme, setThemeState] = useState<FumadocsThemeName>(() =>
    typeof initialSettings.theme === 'string' && isFumadocsThemeName(initialSettings.theme)
      ? initialSettings.theme
      : 'purple'
  )
  const [colorMode, setColorModeState] = useState<ColorMode>(() =>
    initialSettings.colorMode === 'light' ? 'light' : 'dark'
  )
  const [language, setLanguageState] = useState<AppLanguage>(() =>
    normalizeStoredLanguage(initialSettings.language)
  )
  const [font, setFontState] = useState<AppFontName>(() =>
    normalizeStoredFont(initialSettings.font)
  )
  const [viewableDocumentExtensions, setViewableDocumentExtensionsState] = useState<string[]>(() =>
    Array.isArray(initialSettings.viewableDocumentExtensions)
      ? initialSettings.viewableDocumentExtensions
      : [...defaultViewableDocumentExtensions]
  )
  const [askAiButtonAction, setAskAiButtonActionState] = useState<AskAiButtonAction>(() =>
    initialSettings.askAiButtonAction === 'open-sidebar' ? 'open-sidebar' : 'open-sidebar'
  )
  const [workbenchLayout, setWorkbenchLayoutState] = useState<WorkbenchLayoutSettings | undefined>(
    () => initialSettings.workbenchLayout
  )
  const [, rerenderForLocaleChange] = useState(0)

  useEffect(() => {
    void window.api.getSettings().then((settings) => {
      const nextTheme = isFumadocsThemeName(settings.theme) ? settings.theme : 'purple'
      const nextColorMode = settings.colorMode === 'light' ? 'light' : 'dark'
      const nextLanguage = normalizeStoredLanguage(settings.language)
      const nextFont = normalizeStoredFont(settings.font)
      setThemeState(nextTheme)
      setColorModeState(nextColorMode)
      setLanguageState(nextLanguage)
      setFontState(nextFont)
      setViewableDocumentExtensionsState(settings.viewableDocumentExtensions)
      setAskAiButtonActionState(settings.askAiButtonAction)
      setWorkbenchLayoutState(settings.workbenchLayout)
      applyFumadocsTheme(nextTheme, nextColorMode)
      applyLanguage(nextLanguage)
      applyAppFont(nextFont)
      rerenderForLocaleChange((version) => version + 1)
    })
  }, [])

  useEffect(() => {
    applyFumadocsTheme(theme, colorMode)
  }, [theme, colorMode])

  async function setTheme(themeName: FumadocsThemeName): Promise<void> {
    setThemeState(themeName)
    const settings = await window.api.setSettings({ theme: themeName })
    if (isFumadocsThemeName(settings.theme)) setThemeState(settings.theme)
  }

  async function setColorMode(mode: ColorMode): Promise<void> {
    setColorModeState(mode)
    const settings = await window.api.setSettings({ colorMode: mode })
    setColorModeState(settings.colorMode === 'dark' ? 'dark' : 'light')
  }

  async function setLanguage(languageName: AppLanguage): Promise<void> {
    setLanguageState(languageName)
    applyLanguage(languageName)
    rerenderForLocaleChange((version) => version + 1)
    const settings = await window.api.setSettings({ language: languageName })
    const storedLanguage = normalizeStoredLanguage(settings.language)
    setLanguageState(storedLanguage)
    applyLanguage(storedLanguage)
    rerenderForLocaleChange((version) => version + 1)
  }

  async function setFont(fontName: AppFontName): Promise<void> {
    setFontState(fontName)
    applyAppFont(fontName)
    const settings = await window.api.setSettings({ font: fontName })
    const storedFont = normalizeStoredFont(settings.font)
    setFontState(storedFont)
    applyAppFont(storedFont)
  }

  async function setViewableDocumentExtensions(extensions: string[]): Promise<void> {
    setViewableDocumentExtensionsState(extensions)
    const settings = await window.api.setSettings({ viewableDocumentExtensions: extensions })
    setViewableDocumentExtensionsState(settings.viewableDocumentExtensions)
  }

  async function setAskAiButtonAction(action: AskAiButtonAction): Promise<void> {
    setAskAiButtonActionState(action)
    const settings = await window.api.setSettings({ askAiButtonAction: action })
    setAskAiButtonActionState(settings.askAiButtonAction)
  }

  async function setWorkbenchLayout(layout: WorkbenchLayoutSettings): Promise<void> {
    setWorkbenchLayoutState(layout)
    const settings = await window.api.setSettings({ workbenchLayout: layout })
    setWorkbenchLayoutState(settings.workbenchLayout)
  }

  return {
    theme,
    colorMode,
    language,
    font,
    viewableDocumentExtensions,
    askAiButtonAction,
    workbenchLayout,
    setTheme,
    setColorMode,
    setLanguage,
    setFont,
    setViewableDocumentExtensions,
    setAskAiButtonAction,
    setWorkbenchLayout
  }
}
