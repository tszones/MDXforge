import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join, resolve } from 'path'

if (process.platform === 'win32') {
  app.setPath('userData', join(app.getPath('temp'), 'mdxforge-dev'))
}

import icon from '../../resources/icon.png?asset'
import {
  getLastOpenFile,
  openMdxFile,
  openMdxFolder,
  readMdxWorkspace,
  resolveMdxTarget,
  setLastOpenPath
} from './mdx'

import {
  type AppColorMode,
  type AppLanguage,
  type AppThemeName,
  getAppSettings,
  setAppSettings
} from './settings'
import { checkForUpdatesOnStartup, registerUpdaterIpc } from './updater'

let mainWindow: BrowserWindow | null = null

function getMdxPathFromArgv(argv: string[]): string | null {
  return (
    argv
      .filter((arg) => !arg.startsWith('-'))
      .map((arg) => resolveMdxTarget(resolve(arg)))
      .find((filePath) => filePath !== null) ?? null
  )
}

async function openMdxPath(filePath: string): Promise<void> {
  if (!mainWindow) return

  try {
    const workspace = await readMdxWorkspace(filePath)
    setLastOpenPath(workspace.file.path)
    mainWindow.webContents.send('mdx:file-opened', workspace)
  } catch (cause) {
    mainWindow.webContents.send(
      'mdx:file-open-error',
      cause instanceof Error ? cause.message : String(cause)
    )
  }
}

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
    if (initialPath) void openMdxPath(initialPath)
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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return false
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
    return mainWindow.isMaximized()
  })
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)
  ipcMain.handle('mdx:open-file', () => openMdxFile())
  ipcMain.handle('mdx:open-folder', () => openMdxFolder())
  ipcMain.handle('mdx:open-path', (_, filePath: string) => readMdxWorkspace(filePath))
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

  app.on('second-instance', (_, argv) => {
    const filePath = getMdxPathFromArgv(argv)

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    if (filePath) void openMdxPath(filePath)
  })

  createWindow()
  checkForUpdatesOnStartup(() => mainWindow)

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

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
