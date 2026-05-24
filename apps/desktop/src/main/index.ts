import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, protocol, shell } from 'electron'
import { readFileSync } from 'fs'
import { extname, join } from 'path'

if (process.platform === 'win32') {
  app.setPath('userData', join(app.getPath('temp'), 'mdxforge-dev'))
}

import icon from '../../resources/icon.png?asset'
import { getMdxPathFromArgv, openMdxPath } from './app-open'
import { getWorkspaceExtensionAssetPath, type WorkspaceExtensionManifest } from './extensions'
import { registerAppIpc } from './ipc'
import { registerLocalImageProtocol, registerLocalImageScheme } from './local-image-protocol'
import { getLastOpenFile } from './mdx'
import { checkForUpdatesOnStartup, registerUpdaterIpc } from './updater'

let mainWindow: BrowserWindow | null = null
const currentExtensionManifestRef: { current: WorkspaceExtensionManifest | null } = {
  current: null
}
let workspaceExtensionsEnabled = false

function setCurrentExtensionManifest(manifest: WorkspaceExtensionManifest | null): void {
  currentExtensionManifestRef.current = manifest
  workspaceExtensionsEnabled = false
}

registerLocalImageScheme()
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'mdxforge-extension',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

const pendingOpenPath = getMdxPathFromArgv(process.argv)
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    title: 'MDXForge',
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    const initialPath = pendingOpenPath ?? getLastOpenFile()
    if (initialPath) void openMdxPath(initialPath, mainWindow, setCurrentExtensionManifest)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.tszones.mdxforge')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerUpdaterIpc(() => mainWindow)
  registerLocalImageProtocol()
  protocol.handle('mdxforge-extension', (request) => {
    if (!workspaceExtensionsEnabled) return new Response('Not found', { status: 404 })
    if (!currentExtensionManifestRef.current) return new Response('Not found', { status: 404 })

    const assetPath = getWorkspaceExtensionAssetPath(
      currentExtensionManifestRef.current,
      request.url
    )
    if (!assetPath) return new Response('Not found', { status: 404 })

    return new Response(readFileSync(assetPath), {
      headers: {
        'content-type': getExtensionAssetContentType(assetPath)
      }
    })
  })

  registerAppIpc({
    getMainWindow: () => mainWindow,
    getCurrentExtensionManifest: () => currentExtensionManifestRef.current,
    setCurrentExtensionManifest,
    setWorkspaceExtensionsEnabled: (enabled) => {
      workspaceExtensionsEnabled = enabled
    }
  })

  app.on('second-instance', (_, argv) => {
    const filePath = getMdxPathFromArgv(argv)

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    if (filePath) void openMdxPath(filePath, mainWindow, setCurrentExtensionManifest)
  })

  createWindow()
  checkForUpdatesOnStartup(() => mainWindow)

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function getExtensionAssetContentType(filePath: string): string {
  switch (extname(filePath).toLowerCase()) {
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
