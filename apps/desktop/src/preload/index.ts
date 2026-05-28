import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc'

function getInitialSettings(): unknown {
  const prefix = '--mdxforge-initial-settings='
  const argument = process.argv.find((value) => value.startsWith(prefix))
  if (!argument) return null

  try {
    return JSON.parse(decodeURIComponent(argument.slice(prefix.length)))
  } catch {
    return null
  }
}

// Custom APIs for renderer
const api = {
  minimizeWindow: () => ipcRenderer.invoke(IpcChannels.window.minimize),
  maximizeWindow: () => ipcRenderer.invoke(IpcChannels.window.maximize),
  closeWindow: () => ipcRenderer.invoke(IpcChannels.window.close),
  isWindowMaximized: () => ipcRenderer.invoke(IpcChannels.window.isMaximized),
  getVersions: () => process.versions,
  getInitialSettings,
  openMdxFile: () => ipcRenderer.invoke(IpcChannels.mdx.openFile),
  openMdxFolder: () => ipcRenderer.invoke(IpcChannels.mdx.openFolder),
  openMdxPath: (filePath: string, workspaceRoot?: string, refreshFolder?: boolean) =>
    ipcRenderer.invoke(IpcChannels.mdx.openPath, filePath, workspaceRoot, refreshFolder),
  renameMdxPath: (targetPath: string, nextName: string, workspaceRoot?: string) =>
    ipcRenderer.invoke(IpcChannels.mdx.renamePath, targetPath, nextName, workspaceRoot),
  deleteMdxPath: (targetPath: string, workspaceRoot?: string) =>
    ipcRenderer.invoke(IpcChannels.mdx.deletePath, targetPath, workspaceRoot),
  copyMdxRawSource: (filePath: string) =>
    ipcRenderer.invoke(IpcChannels.mdx.copyRawSource, filePath),
  copyPath: (filePath: string) => ipcRenderer.invoke(IpcChannels.mdx.copyPath, filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke(IpcChannels.mdx.showInFolder, filePath),
  openInVsCode: (filePath: string) => ipcRenderer.invoke(IpcChannels.mdx.openInVsCode, filePath),
  searchMdxWorkspace: (workspaceRoot: string, query: string) =>
    ipcRenderer.invoke(IpcChannels.mdx.searchWorkspace, workspaceRoot, query),
  setWorkspaceExtensionsEnabled: (enabled: boolean, trustKey?: string) =>
    ipcRenderer.invoke(IpcChannels.mdx.setWorkspaceExtensionsEnabled, enabled, trustKey),
  getWorkspaceSkills: (workspaceRoot: string) =>
    ipcRenderer.invoke(IpcChannels.skills.getWorkspace, workspaceRoot),
  addLocalSkillFolder: (workspaceRoot: string) =>
    ipcRenderer.invoke(IpcChannels.skills.addLocalFolder, workspaceRoot),
  createLocalSkill: (workspaceRoot: string, name: string, type: string) =>
    ipcRenderer.invoke(IpcChannels.skills.createLocal, workspaceRoot, name, type),
  copySkillRules: (rules: string) => ipcRenderer.invoke(IpcChannels.skills.copyRules, rules),
  detectAgents: () => ipcRenderer.invoke(IpcChannels.skills.detectAgents),
  openAgentPath: (targetPath: string) =>
    ipcRenderer.invoke(IpcChannels.skills.openAgentPath, targetPath),
  previewAgentInstall: (workspaceRoot: string, agentId: string) =>
    ipcRenderer.invoke(IpcChannels.skills.previewAgentInstall, workspaceRoot, agentId),
  applyAgentInstall: (workspaceRoot: string, agentId: string) =>
    ipcRenderer.invoke(IpcChannels.skills.applyAgentInstall, workspaceRoot, agentId),
  previewAgentDisable: (workspaceRoot: string, agentId: string) =>
    ipcRenderer.invoke(IpcChannels.skills.previewAgentDisable, workspaceRoot, agentId),
  applyAgentDisable: (workspaceRoot: string, agentId: string) =>
    ipcRenderer.invoke(IpcChannels.skills.applyAgentDisable, workspaceRoot, agentId),
  disableAgentInstall: (workspaceRoot: string, agentId: string) =>
    ipcRenderer.invoke(IpcChannels.skills.disableAgentInstall, workspaceRoot, agentId),
  registerDefaultMdxApp: () => ipcRenderer.invoke(IpcChannels.mdx.registerDefaultApp),
  isDefaultMdxApp: () => ipcRenderer.invoke(IpcChannels.mdx.isDefaultApp),
  getSettings: () => ipcRenderer.invoke(IpcChannels.settings.get),
  setSettings: (settings: unknown) => ipcRenderer.invoke(IpcChannels.settings.set, settings),
  getUpdateState: () => ipcRenderer.invoke(IpcChannels.update.getState),
  checkForUpdates: () => ipcRenderer.invoke(IpcChannels.update.check),
  quitAndInstallUpdate: () => ipcRenderer.invoke(IpcChannels.update.quitAndInstall),
  onUpdateState: (callback: (updateState: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, updateState: unknown): void =>
      callback(updateState)
    ipcRenderer.on(IpcChannels.update.state, listener)
    return () => ipcRenderer.removeListener(IpcChannels.update.state, listener)
  },
  onMdxFileOpened: (callback: (file: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, file: unknown): void => callback(file)
    ipcRenderer.on(IpcChannels.mdx.fileOpened, listener)
    return () => ipcRenderer.removeListener(IpcChannels.mdx.fileOpened, listener)
  },
  onMdxFileChanged: (callback: (file: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, file: unknown): void => callback(file)
    ipcRenderer.on(IpcChannels.mdx.fileChanged, listener)
    return () => ipcRenderer.removeListener(IpcChannels.mdx.fileChanged, listener)
  },
  onMdxFileOpenError: (callback: (message: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on(IpcChannels.mdx.fileOpenError, listener)
    return () => ipcRenderer.removeListener(IpcChannels.mdx.fileOpenError, listener)
  },
  onMdxFileChangeError: (callback: (message: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on(IpcChannels.mdx.fileChangeError, listener)
    return () => ipcRenderer.removeListener(IpcChannels.mdx.fileChangeError, listener)
  }
}

// Expose a minimal, app-specific IPC API.
// Do not import @electron-toolkit/preload here: sandboxed preload scripts cannot
// resolve external node_modules reliably in dev/prod unless bundled.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.api = api
}
