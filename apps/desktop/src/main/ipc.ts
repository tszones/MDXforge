import { app, type BrowserWindow, clipboard, ipcMain } from 'electron'
import { type SetExtensionManifest, watchMdxWorkspace } from './app-open'
import { getWorkspaceExtensionTrustKey, type WorkspaceExtensionManifest } from './extensions'
import { openMdxFile, openMdxFolder, readMdxWorkspace, renameMdxPath } from './mdx'
import { readMdxRawSource } from './mdx-raw-source'
import { readMdxFolder } from './page-tree'
import {
  type AppColorMode,
  type AppLanguage,
  type AppThemeName,
  getAppSettings,
  setAppSettings
} from './settings'
import { searchMdxWorkspaceFiles } from './workspace-search'

export function registerAppIpc(options: {
  getMainWindow: () => BrowserWindow | null
  getCurrentExtensionManifest: () => WorkspaceExtensionManifest | null
  setCurrentExtensionManifest: SetExtensionManifest
  setWorkspaceExtensionsEnabled: (enabled: boolean) => void
}): void {
  const getMainWindow = options.getMainWindow
  const setCurrentExtensionManifest = options.setCurrentExtensionManifest
  const getCurrentExtensionManifest = options.getCurrentExtensionManifest
  let workspaceExtensionsEnabled = false
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('window:minimize', () => getMainWindow()?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (!getMainWindow()) return false
    if (getMainWindow()?.isMaximized()) getMainWindow()?.unmaximize()
    else getMainWindow()?.maximize()
    return getMainWindow()?.isMaximized() ?? false
  })
  ipcMain.handle('window:close', () => getMainWindow()?.close())
  ipcMain.handle('window:is-maximized', () => getMainWindow()?.isMaximized() ?? false)
  ipcMain.handle('mdx:open-file', async () => {
    const workspace = await openMdxFile()
    if (workspace) {
      const mainWindow = getMainWindow()
      if (!mainWindow) return workspace
      setCurrentExtensionManifest(workspace.extensions ?? null)
      watchMdxWorkspace(
        workspace.file.path,
        workspace.folder?.rootPath,
        mainWindow,
        setCurrentExtensionManifest
      )
    }
    return workspace
  })
  ipcMain.handle('mdx:open-folder', async () => {
    const workspace = await openMdxFolder()
    if (workspace) {
      const mainWindow = getMainWindow()
      if (!mainWindow) return workspace
      setCurrentExtensionManifest(workspace.extensions ?? null)
      watchMdxWorkspace(
        workspace.folder?.rootPath ?? workspace.file.path,
        workspace.folder?.rootPath,
        mainWindow,
        setCurrentExtensionManifest
      )
    }
    return workspace
  })
  ipcMain.handle('mdx:open-path', async (_, filePath: string, workspaceRoot?: string) => {
    const workspace = await readMdxWorkspace(filePath, workspaceRoot)
    setCurrentExtensionManifest(workspace.extensions ?? null)
    const mainWindow = getMainWindow()
    if (mainWindow) {
      watchMdxWorkspace(
        filePath,
        workspace.folder?.rootPath,
        mainWindow,
        setCurrentExtensionManifest
      )
    }
    return workspace
  })
  ipcMain.handle(
    'mdx:rename-path',
    async (_, targetPath: string, nextName: string, workspaceRoot?: string) => {
      const workspace = await renameMdxPath(targetPath, nextName, workspaceRoot)
      setCurrentExtensionManifest(workspace.extensions ?? null)
      const mainWindow = getMainWindow()
      if (mainWindow) {
        watchMdxWorkspace(
          workspace.file.path,
          workspace.folder?.rootPath,
          mainWindow,
          setCurrentExtensionManifest
        )
      }
      return workspace
    }
  )
  ipcMain.handle(
    'mdx:set-workspace-extensions-enabled',
    (_, enabled: boolean, trustKey?: string) => {
      const currentExtensionManifest = getCurrentExtensionManifest()
      const currentTrustKey = currentExtensionManifest
        ? getWorkspaceExtensionTrustKey(currentExtensionManifest)
        : null
      workspaceExtensionsEnabled = enabled && Boolean(trustKey && trustKey === currentTrustKey)
      options.setWorkspaceExtensionsEnabled(workspaceExtensionsEnabled)
      return workspaceExtensionsEnabled
    }
  )
  ipcMain.handle('mdx:copy-raw-source', (_, filePath: string) => {
    clipboard.writeText(readMdxRawSource(filePath))
  })
  ipcMain.handle('mdx:search-workspace', async (_, workspaceRoot: string, query: string) => {
    const folder = readMdxFolder(workspaceRoot)
    return searchMdxWorkspaceFiles(folder.files, query)
  })
  ipcMain.handle('mdx:register-default-app', () => app.setAsDefaultProtocolClient('mdx'))
  ipcMain.handle('mdx:is-default-app', () => app.isDefaultProtocolClient('mdx'))
  ipcMain.handle('settings:get', () => getAppSettings())
  ipcMain.handle(
    'settings:set',
    (
      _,
      settings: Partial<{ theme: AppThemeName; colorMode: AppColorMode; language: AppLanguage }>
    ) => setAppSettings(settings)
  )
}
