import { useEffect, useState } from 'react'
import { MdxPreview } from './components/MdxPreview'
import { SettingsPage } from './components/SettingsPage'
import { WindowTitleBar } from './components/WindowTitleBar'
import {
  applyFumadocsTheme,
  type ColorMode,
  type FumadocsThemeName,
  isFumadocsThemeName
} from './lib/theme'
import type { MdxWorkspace } from './types'

type ViewMode = 'preview' | 'settings'

function App(): React.JSX.Element {
  const [workspace, setWorkspace] = useState<MdxWorkspace | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [theme, setThemeState] = useState<FumadocsThemeName>('neutral')
  const [colorMode, setColorModeState] = useState<ColorMode>('light')

  useEffect(() => {
    void window.api.getSettings().then((settings) => {
      const nextTheme = isFumadocsThemeName(settings.theme) ? settings.theme : 'neutral'
      const nextColorMode = settings.colorMode === 'dark' ? 'dark' : 'light'
      setThemeState(nextTheme)
      setColorModeState(nextColorMode)
      applyFumadocsTheme(nextTheme, nextColorMode)
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

  useEffect(() => {
    void window.api.registerDefaultMdxApp()

    const removeOpenedListener = window.api.onMdxFileOpened((openedWorkspace) => {
      setWorkspace(openedWorkspace)
      setError(null)
      setViewMode('preview')
    })
    const removeErrorListener = window.api.onMdxFileOpenError((message) => {
      setError(message)
    })

    return () => {
      removeOpenedListener()
      removeErrorListener()
    }
  }, [])

  async function openFile(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.openMdxFile()
      if (result) {
        setWorkspace(result)
        setViewMode('preview')
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
        setViewMode('preview')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function openPath(filePath: string): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      setWorkspace(await window.api.openMdxPath(filePath))
      setViewMode('preview')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-fd-background pt-10 text-fd-foreground">
      <WindowTitleBar viewMode={viewMode} onViewModeChange={setViewMode} />
      {viewMode === 'settings' ? (
        <SettingsPage
          theme={theme}
          mode={colorMode}
          onThemeChange={(nextTheme) => void setTheme(nextTheme)}
          onModeChange={(nextMode) => void setColorMode(nextMode)}
          onBack={() => setViewMode('preview')}
        />
      ) : (
        <>
          {workspace ? null : (
            <header className="flex shrink-0 items-center gap-3 border-b bg-fd-background/95 px-4 py-3 backdrop-blur">
              <button
                type="button"
                onClick={openFile}
                disabled={loading}
                className="rounded-md bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
              >
                {loading ? '打开中…' : '打开 MDX 文件'}
              </button>
              <button
                type="button"
                onClick={openFolder}
                disabled={loading}
                className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                打开文件夹
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
              opening={loading}
            />
          ) : (
            <section className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-8 text-center">
              <div>
                <h1 className="mb-2 text-3xl font-semibold">Docuforge</h1>
                <p className="mb-6 text-fd-muted-foreground">
                  AI-native MDX docs workspace. 选择一个 .mdx/.md 文件或文件夹并渲染。
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={openFile}
                    disabled={loading}
                    className="rounded-md bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground disabled:opacity-60"
                  >
                    选择文件
                  </button>
                  <button
                    type="button"
                    onClick={openFolder}
                    disabled={loading}
                    className="rounded-md border px-4 py-2 font-medium disabled:opacity-60"
                  >
                    选择文件夹
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
