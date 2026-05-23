import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  getVersions: () => process.versions,
  openMdxFile: () => ipcRenderer.invoke('mdx:open-file'),
  openMdxFolder: () => ipcRenderer.invoke('mdx:open-folder'),
  openMdxPath: (filePath: string, workspaceRoot?: string) =>
    ipcRenderer.invoke('mdx:open-path', filePath, workspaceRoot),
  registerDefaultMdxApp: () => ipcRenderer.invoke('mdx:register-default-app'),
  isDefaultMdxApp: () => ipcRenderer.invoke('mdx:is-default-app'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: unknown) => ipcRenderer.invoke('settings:set', settings),
  getUpdateState: () => ipcRenderer.invoke('update:get-state'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('update:quit-and-install'),
  onUpdateState: (callback: (updateState: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, updateState: unknown): void =>
      callback(updateState)
    ipcRenderer.on('update:state', listener)
    return () => ipcRenderer.removeListener('update:state', listener)
  },
  onMdxFileOpened: (callback: (file: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, file: unknown): void => callback(file)
    ipcRenderer.on('mdx:file-opened', listener)
    return () => ipcRenderer.removeListener('mdx:file-opened', listener)
  },
  onMdxFileChanged: (callback: (file: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, file: unknown): void => callback(file)
    ipcRenderer.on('mdx:file-changed', listener)
    return () => ipcRenderer.removeListener('mdx:file-changed', listener)
  },
  onMdxFileOpenError: (callback: (message: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on('mdx:file-open-error', listener)
    return () => ipcRenderer.removeListener('mdx:file-open-error', listener)
  },
  onMdxFileChangeError: (callback: (message: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on('mdx:file-change-error', listener)
    return () => ipcRenderer.removeListener('mdx:file-change-error', listener)
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
