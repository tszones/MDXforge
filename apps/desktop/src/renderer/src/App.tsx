import { useHotkeys } from '@tanstack/react-hotkeys'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { FindInPageBar } from './components/FindInPageBar'
import { MdxPreview } from './components/MdxPreview'
import { SearchOverlay } from './components/SearchOverlay'
import { SettingsPage, type SettingsRoute } from './components/SettingsPage'
import { WindowTitleBar } from './components/WindowTitleBar'
import { useAppSettings } from './hooks/useAppSettings'
import { useWorkspaceActions } from './hooks/useWorkspaceActions'
import { appHotkeys } from './lib/hotkeys'
import type { ColorMode, FumadocsThemeName } from './lib/theme'
import { m } from './paraglide/messages'
import type { AppFontName, AppLanguage, AskAiButtonAction, WorkbenchLayoutSettings } from './types'

function App(): React.JSX.Element {
  const {
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
  } = useAppSettings()

  return (
    <AppContent
      theme={theme}
      colorMode={colorMode}
      language={language}
      font={font}
      viewableDocumentExtensions={viewableDocumentExtensions}
      askAiButtonAction={askAiButtonAction}
      workbenchLayout={workbenchLayout}
      onThemeChange={(nextTheme) => void setTheme(nextTheme)}
      onColorModeChange={(nextMode) => void setColorMode(nextMode)}
      onLanguageChange={(nextLanguage) => void setLanguage(nextLanguage)}
      onFontChange={(nextFont) => void setFont(nextFont)}
      onViewableDocumentExtensionsChange={(nextExtensions) =>
        void setViewableDocumentExtensions(nextExtensions)
      }
      onAskAiButtonActionChange={(nextAction) => void setAskAiButtonAction(nextAction)}
      onWorkbenchLayoutChange={(nextLayout) => void setWorkbenchLayout(nextLayout)}
    />
  )
}

function AppContent({
  theme,
  colorMode,
  language,
  font,
  viewableDocumentExtensions,
  askAiButtonAction,
  workbenchLayout,
  onThemeChange,
  onColorModeChange,
  onLanguageChange,
  onFontChange,
  onViewableDocumentExtensionsChange,
  onAskAiButtonActionChange,
  onWorkbenchLayoutChange
}: {
  theme: FumadocsThemeName
  colorMode: ColorMode
  language: AppLanguage
  font: AppFontName
  viewableDocumentExtensions: string[]
  askAiButtonAction: AskAiButtonAction
  workbenchLayout: WorkbenchLayoutSettings | undefined
  onThemeChange: (theme: FumadocsThemeName) => void
  onColorModeChange: (mode: ColorMode) => void
  onLanguageChange: (language: AppLanguage) => void
  onFontChange: (font: AppFontName) => void
  onViewableDocumentExtensionsChange: (extensions: string[]) => void
  onAskAiButtonActionChange: (action: AskAiButtonAction) => void
  onWorkbenchLayoutChange: (layout: WorkbenchLayoutSettings) => void
}): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    workspace,
    error,
    loading,
    setWorkspace,
    openFile,
    openFolder,
    openPath,
    renamePath,
    deletePath
  } = useWorkspaceActions()
  const inSettingsRoute =
    location.pathname === '/settings' || location.pathname.startsWith('/settings/')

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
        viewableDocumentExtensions={viewableDocumentExtensions}
        askAiButtonAction={askAiButtonAction}
        onThemeChange={onThemeChange}
        onModeChange={onColorModeChange}
        onLanguageChange={onLanguageChange}
        onFontChange={onFontChange}
        onViewableDocumentExtensionsChange={onViewableDocumentExtensionsChange}
        onAskAiButtonActionChange={onAskAiButtonActionChange}
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
        <pre
          className="fixed top-14 right-4 z-50 max-h-48 max-w-[min(42rem,calc(100vw-2rem))] overflow-auto whitespace-pre-wrap rounded-lg border border-fd-error/30 bg-fd-background/95 p-4 text-sm text-fd-error shadow-xl backdrop-blur"
          role="alert"
        >
          {error}
        </pre>
      ) : null}

      {workspace ? (
        <MdxPreview
          workspace={workspace}
          setWorkspace={setWorkspace}
          onOpenPath={openPath}
          onRenamePath={renamePath}
          onDeletePath={deletePath}
          workbenchLayout={workbenchLayout}
          askAiButtonAction={askAiButtonAction}
          onWorkbenchLayoutChange={onWorkbenchLayoutChange}
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
        colorMode={colorMode}
        opening={loading}
        onBackToPreview={() => navigate('/')}
        onOpenFile={() => void openFile()}
        onOpenFolder={() => void openFolder()}
        onOpenSettings={() => navigate('/settings/language')}
        onToggleColorMode={() => onColorModeChange(colorMode === 'dark' ? 'light' : 'dark')}
      />
      <FindInPageBar
        enabled={Boolean(workspace && !inSettingsRoute)}
        sourceKey={workspace?.file.path ?? ''}
      />
      <SearchOverlay workspace={workspace} onOpenPath={openPath} />
      <Routes>
        <Route path="/settings" element={<Navigate to="/settings/language" replace />} />
        <Route path="/settings/language" element={renderSettingsRoute('language')} />
        <Route path="/settings/appearance" element={renderSettingsRoute('appearance')} />
        <Route path="/settings/documents" element={renderSettingsRoute('documents')} />
        <Route path="/settings/updates" element={renderSettingsRoute('updates')} />
        <Route path="/settings/skills" element={renderSettingsRoute('skills')} />
        <Route path="/settings/ask-ai" element={renderSettingsRoute('ask-ai')} />
        <Route path="/settings/*" element={<Navigate to="/settings/language" replace />} />
        <Route path="*" element={previewRoute} />
      </Routes>
    </main>
  )
}

export default App
