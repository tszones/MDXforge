import { useHotkeys } from '@tanstack/react-hotkeys'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { MdxPreview } from './components/MdxPreview'
import { SearchOverlay } from './components/SearchOverlay'
import { SettingsPage, type SettingsRoute } from './components/SettingsPage'
import { WindowTitleBar } from './components/WindowTitleBar'
import { applyAppFont, normalizeStoredFont } from './lib/font'
import { appHotkeys } from './lib/hotkeys'
import { applyLanguage, normalizeStoredLanguage } from './lib/language'
import {
  applyFumadocsTheme,
  type ColorMode,
  type FumadocsThemeName,
  isFumadocsThemeName
} from './lib/theme'
import { m } from './paraglide/messages'
import type { AppFontName, AppLanguage, MdxWorkspace } from './types'

function App(): React.JSX.Element {
  const [theme, setThemeState] = useState<FumadocsThemeName>('purple')
  const [colorMode, setColorModeState] = useState<ColorMode>('dark')
  const [language, setLanguageState] = useState<AppLanguage>('en-US')
  const [font, setFontState] = useState<AppFontName>('system')
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

  return (
    <AppContent
      theme={theme}
      colorMode={colorMode}
      language={language}
      font={font}
      onThemeChange={(nextTheme) => void setTheme(nextTheme)}
      onColorModeChange={(nextMode) => void setColorMode(nextMode)}
      onLanguageChange={(nextLanguage) => void setLanguage(nextLanguage)}
      onFontChange={(nextFont) => void setFont(nextFont)}
    />
  )
}

function AppContent({
  theme,
  colorMode,
  language,
  font,
  onThemeChange,
  onColorModeChange,
  onLanguageChange,
  onFontChange
}: {
  theme: FumadocsThemeName
  colorMode: ColorMode
  language: AppLanguage
  font: AppFontName
  onThemeChange: (theme: FumadocsThemeName) => void
  onColorModeChange: (mode: ColorMode) => void
  onLanguageChange: (language: AppLanguage) => void
  onFontChange: (font: AppFontName) => void
}): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState<MdxWorkspace | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inSettingsRoute =
    location.pathname === '/settings' || location.pathname.startsWith('/settings/')

  useEffect(() => {
    void window.api.registerDefaultMdxApp()

    const removeOpenedListener = window.api.onMdxFileOpened((openedWorkspace) => {
      setWorkspace(openedWorkspace)
      setError(null)
      navigate('/', { replace: true })
    })
    const removeErrorListener = window.api.onMdxFileOpenError((message) => {
      setError(message)
    })

    return () => {
      removeOpenedListener()
      removeErrorListener()
    }
  }, [navigate])

  async function openFile(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.openMdxFile()
      if (result) {
        setWorkspace(result)
        navigate('/')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function openFolder(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.openMdxFolder()
      if (result) {
        setWorkspace(result)
        navigate('/')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function openPath(filePath: string, workspaceRoot?: string): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      setWorkspace(await window.api.openMdxPath(filePath, workspaceRoot))
      navigate('/')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function renamePath(
    targetPath: string,
    nextName: string,
    workspaceRoot?: string
  ): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      setWorkspace(await window.api.renameMdxPath(targetPath, nextName, workspaceRoot))
      navigate('/')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  useHotkeys(
    [
      {
        hotkey: appHotkeys.openFile,
        callback: () => void openFile(),
        options: {
          enabled: !loading,
          meta: {
            name: 'Open MDX file',
            description: 'Open a local MDX or Markdown file.'
          }
        }
      },
      {
        hotkey: appHotkeys.openFolder,
        callback: () => void openFolder(),
        options: {
          enabled: !loading,
          meta: {
            name: 'Open folder',
            description: 'Open a folder workspace.'
          }
        }
      },
      {
        hotkey: appHotkeys.openSettings,
        callback: () => navigate(inSettingsRoute ? '/' : '/settings/language'),
        options: {
          meta: {
            name: 'Toggle settings',
            description: 'Open or close the settings view.'
          }
        }
      },
      {
        hotkey: appHotkeys.closeSettings,
        callback: () => navigate('/'),
        options: {
          enabled: inSettingsRoute,
          meta: {
            name: 'Back to preview',
            description: 'Close settings and return to the preview.'
          }
        }
      }
    ],
    { ignoreInputs: true }
  )

  function renderSettingsRoute(route: SettingsRoute): React.JSX.Element {
    return (
      <SettingsPage
        page={route}
        theme={theme}
        mode={colorMode}
        language={language}
        font={font}
        onThemeChange={onThemeChange}
        onModeChange={onColorModeChange}
        onLanguageChange={onLanguageChange}
        onFontChange={onFontChange}
        workspaceRoot={workspace?.folder?.rootPath}
        onBack={() => navigate('/')}
      />
    )
  }

  const previewRoute = (
    <>
      {workspace ? null : (
        <header className="flex shrink-0 items-center gap-3 border-b bg-fd-background/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={openFile}
            disabled={loading}
            className="rounded-md bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
          >
            {loading ? m.actions_opening() : m.actions_open_mdx_file()}
          </button>
          <button
            type="button"
            onClick={openFolder}
            disabled={loading}
            className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {m.actions_open_folder()}
          </button>
        </header>
      )}

      {error ? (
        <pre className="m-4 shrink-0 overflow-auto rounded-md border bg-fd-error/10 p-4 text-sm text-fd-error">
          {error}
        </pre>
      ) : null}

      {workspace ? (
        <MdxPreview
          workspace={workspace}
          onOpenFile={openFile}
          onOpenFolder={openFolder}
          onOpenPath={openPath}
          onRenamePath={renamePath}
          opening={loading}
        />
      ) : (
        <section className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-8 text-center">
          <div>
            <h1 className="mb-2 text-3xl font-semibold">MDXForge</h1>
            <p className="mb-6 text-fd-muted-foreground">{m.home_description()}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={openFile}
                disabled={loading}
                className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground disabled:opacity-60"
              >
                {m.actions_select_file()}
              </button>
              <button
                type="button"
                onClick={openFolder}
                disabled={loading}
                className="rounded-md border px-4 py-2 font-medium disabled:opacity-60"
              >
                {m.actions_select_folder()}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-fd-background pt-10 text-fd-foreground">
      <WindowTitleBar
        inSettings={inSettingsRoute}
        onBackToPreview={() => navigate('/')}
        onOpenSettings={() => navigate('/settings/language')}
      />
      <SearchOverlay workspace={workspace} onOpenPath={openPath} />
      <Routes>
        <Route path="/settings" element={<Navigate to="/settings/language" replace />} />
        <Route path="/settings/language" element={renderSettingsRoute('language')} />
        <Route path="/settings/appearance" element={renderSettingsRoute('appearance')} />
        <Route path="/settings/updates" element={renderSettingsRoute('updates')} />
        <Route path="/settings/skills" element={renderSettingsRoute('skills')} />
        <Route path="/settings/*" element={<Navigate to="/settings/language" replace />} />
        <Route path="*" element={previewRoute} />
      </Routes>
    </main>
  )
}

export default App
