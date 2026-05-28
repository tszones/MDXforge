import { app, type BrowserWindow, clipboard, dialog, ipcMain, shell } from 'electron'
import { IpcChannels } from '../shared/ipc'
import { type SetExtensionManifest, watchMdxWorkspace } from './app-open'
import { getWorkspaceExtensionTrustKey, type WorkspaceExtensionManifest } from './extensions'
import { mainMessage } from './i18n'
import {
  deleteMdxPath,
  getCachedMdxWorkspace,
  openMdxFile,
  openMdxFolder,
  readMdxWorkspace,
  renameMdxPath
} from './mdx'
import { readMdxRawSource } from './mdx-raw-source'
import { type AppSettings, getAppSettings, setAppSettings } from './settings'
import {
  addLocalSkillFolder,
  createLocalSkill,
  readWorkspaceSkills,
  type SkillType
} from './skills'
import { detectAgents } from './skills/agents'
import {
  applyAgentDisable,
  applyAgentInstall,
  previewAgentDisable,
  previewAgentInstall
} from './skills/projection'
import type { AgentId } from './skills/types'
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
  ipcMain.handle(IpcChannels.window.minimize, () => getMainWindow()?.minimize())
  ipcMain.handle(IpcChannels.window.maximize, () => {
    if (!getMainWindow()) return false
    if (getMainWindow()?.isMaximized()) getMainWindow()?.unmaximize()
    else getMainWindow()?.maximize()
    return getMainWindow()?.isMaximized() ?? false
  })
  ipcMain.handle(IpcChannels.window.close, () => getMainWindow()?.close())
  ipcMain.handle(IpcChannels.window.isMaximized, () => getMainWindow()?.isMaximized() ?? false)
  ipcMain.handle(IpcChannels.mdx.openFile, async () => {
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
  ipcMain.handle(IpcChannels.mdx.openFolder, async () => {
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
  ipcMain.handle(
    IpcChannels.mdx.openPath,
    async (_, filePath: string, workspaceRoot?: string, refreshFolder = true) => {
      const workspace = await readMdxWorkspace(filePath, workspaceRoot, { refreshFolder })
      setCurrentExtensionManifest(workspace.extensions ?? getCurrentExtensionManifest())
      const mainWindow = getMainWindow()
      if (mainWindow) {
        watchMdxWorkspace(
          filePath,
          workspace.folder?.rootPath ?? workspaceRoot,
          mainWindow,
          setCurrentExtensionManifest
        )
      }
      return workspace
    }
  )
  ipcMain.handle(
    IpcChannels.mdx.renamePath,
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
    IpcChannels.mdx.deletePath,
    async (_, targetPath: string, workspaceRoot?: string) => {
      const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: [mainMessage('dialog_delete_confirm'), mainMessage('dialog_delete_cancel')],
        defaultId: 1,
        cancelId: 1,
        title: mainMessage('dialog_delete_title'),
        message: mainMessage('dialog_delete_message', { filePath: targetPath })
      })
      if (result.response !== 0) return null

      const workspace = await deleteMdxPath(targetPath, workspaceRoot)
      setCurrentExtensionManifest(workspace?.extensions ?? null)
      return workspace
    }
  )
  ipcMain.handle(
    IpcChannels.mdx.setWorkspaceExtensionsEnabled,
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
  ipcMain.handle(IpcChannels.mdx.copyRawSource, (_, filePath: string) => {
    clipboard.writeText(readMdxRawSource(filePath))
  })
  ipcMain.handle(IpcChannels.mdx.copyPath, (_, filePath: string) => {
    clipboard.writeText(filePath)
  })
  ipcMain.handle(IpcChannels.mdx.showInFolder, (_, filePath: string) => {
    if (!filePath) return false
    shell.showItemInFolder(filePath)
    return true
  })
  ipcMain.handle(IpcChannels.mdx.openInVsCode, async (_, filePath: string) => {
    if (!filePath) return false
    await shell.openExternal(`vscode://file/${toVsCodeFilePath(filePath)}`)
    return true
  })
  ipcMain.handle(
    IpcChannels.mdx.searchWorkspace,
    async (_, workspaceRoot: string, query: string) => {
      const cachedWorkspace = getCachedMdxWorkspace(workspaceRoot)
      const folder = cachedWorkspace?.folder ?? (await readMdxWorkspace(workspaceRoot)).folder
      return searchMdxWorkspaceFiles(folder?.files ?? [], query)
    }
  )
  ipcMain.handle(IpcChannels.skills.getWorkspace, (_, workspaceRoot: string) =>
    readWorkspaceSkills(workspaceRoot)
  )
  ipcMain.handle(IpcChannels.skills.addLocalFolder, async (_, workspaceRoot: string) =>
    addLocalSkillFolder(workspaceRoot)
  )
  ipcMain.handle(
    IpcChannels.skills.createLocal,
    (_, workspaceRoot: string, name: string, type: SkillType) =>
      createLocalSkill(workspaceRoot, name, type)
  )
  ipcMain.handle(IpcChannels.skills.copyRules, (_, rules: string) => {
    clipboard.writeText(rules)
  })
  ipcMain.handle(IpcChannels.skills.detectAgents, () => detectAgents())
  ipcMain.handle(IpcChannels.skills.openAgentPath, async (_, targetPath: string) => {
    if (!targetPath) return false
    await shell.openPath(targetPath)
    return true
  })
  ipcMain.handle(
    IpcChannels.skills.previewAgentInstall,
    (_, workspaceRoot: string, agentId: AgentId) => previewAgentInstall(workspaceRoot, agentId)
  )
  ipcMain.handle(
    IpcChannels.skills.applyAgentInstall,
    (_, workspaceRoot: string, agentId: AgentId) => applyAgentInstall(workspaceRoot, agentId)
  )
  ipcMain.handle(
    IpcChannels.skills.previewAgentDisable,
    (_, workspaceRoot: string, agentId: AgentId) => previewAgentDisable(workspaceRoot, agentId)
  )
  ipcMain.handle(
    IpcChannels.skills.applyAgentDisable,
    (_, workspaceRoot: string, agentId: AgentId) => applyAgentDisable(workspaceRoot, agentId)
  )
  ipcMain.handle(
    IpcChannels.skills.disableAgentInstall,
    (_, workspaceRoot: string, agentId: AgentId) => applyAgentDisable(workspaceRoot, agentId)
  )
  ipcMain.handle(IpcChannels.mdx.registerDefaultApp, () => app.setAsDefaultProtocolClient('mdx'))
  ipcMain.handle(IpcChannels.mdx.isDefaultApp, () => app.isDefaultProtocolClient('mdx'))
  ipcMain.handle(IpcChannels.settings.get, () => getAppSettings())
  ipcMain.handle(IpcChannels.settings.set, (_, settings: Partial<AppSettings>) =>
    setAppSettings(settings)
  )
}

function toVsCodeFilePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
    .replace(/^([A-Za-z])%3A/, '$1:')
}
