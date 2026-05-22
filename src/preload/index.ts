import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  openMdxFile: () => ipcRenderer.invoke('mdx:open-file'),
  openMdxFolder: () => ipcRenderer.invoke('mdx:open-folder'),
  openMdxPath: (filePath) => ipcRenderer.invoke('mdx:open-path', filePath),
  registerDefaultMdxApp: () => ipcRenderer.invoke('mdx:register-default-app'),
  isDefaultMdxApp: () => ipcRenderer.invoke('mdx:is-default-app'),
  onMdxFileOpened: (callback) => {
    const listener = (_, file) => callback(file)
    ipcRenderer.on('mdx:file-opened', listener)
    return () => ipcRenderer.removeListener('mdx:file-opened', listener)
  },
  onMdxFileOpenError: (callback) => {
    const listener = (_, message) => callback(message)
    ipcRenderer.on('mdx:file-open-error', listener)
    return () => ipcRenderer.removeListener('mdx:file-open-error', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
