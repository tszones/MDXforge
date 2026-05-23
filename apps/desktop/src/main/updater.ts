import { app, type BrowserWindow, ipcMain } from 'electron'
import { autoUpdater, type UpdateInfo } from 'electron-updater'
import { mainMessage } from './i18n'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateState {
  status: UpdateStatus
  version: string
  availableVersion?: string
  percent?: number
  message?: string
}

let state: UpdateState = {
  status: 'idle',
  version: app.getVersion()
}

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause)
}

function publish(next: Partial<UpdateState>, window: BrowserWindow | null): UpdateState {
  state = {
    ...state,
    ...next,
    version: app.getVersion()
  }
  window?.webContents.send('update:state', state)
  return state
}

function infoVersion(info: UpdateInfo): string | undefined {
  return info.version || undefined
}

export function registerUpdaterIpc(getWindow: () => BrowserWindow | null): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    publish({ status: 'checking', message: undefined, percent: undefined }, getWindow())
  })

  autoUpdater.on('update-available', (info) => {
    publish(
      {
        status: 'available',
        availableVersion: infoVersion(info),
        message: undefined,
        percent: undefined
      },
      getWindow()
    )
  })

  autoUpdater.on('update-not-available', (info) => {
    publish(
      {
        status: 'not-available',
        availableVersion: infoVersion(info),
        message: undefined,
        percent: undefined
      },
      getWindow()
    )
  })

  autoUpdater.on('download-progress', (progress) => {
    publish(
      {
        status: 'downloading',
        percent: Math.round(progress.percent),
        message: undefined
      },
      getWindow()
    )
  })

  autoUpdater.on('update-downloaded', (info) => {
    publish(
      {
        status: 'downloaded',
        availableVersion: infoVersion(info),
        percent: 100,
        message: undefined
      },
      getWindow()
    )
  })

  autoUpdater.on('error', (error) => {
    publish({ status: 'error', message: toMessage(error), percent: undefined }, getWindow())
  })

  ipcMain.handle('update:get-state', () => state)
  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) {
      return publish(
        {
          status: 'error',
          message: mainMessage('error_updates_packaged_only'),
          percent: undefined
        },
        getWindow()
      )
    }

    try {
      publish({ status: 'checking', message: undefined, percent: undefined }, getWindow())
      await autoUpdater.checkForUpdates()
    } catch (cause) {
      publish({ status: 'error', message: toMessage(cause), percent: undefined }, getWindow())
    }

    return state
  })
  ipcMain.handle('update:quit-and-install', () => {
    autoUpdater.quitAndInstall(false, true)
  })
}

export function checkForUpdatesOnStartup(getWindow: () => BrowserWindow | null): void {
  if (!app.isPackaged) return
  setTimeout(() => {
    void autoUpdater.checkForUpdates().catch((cause) => {
      publish({ status: 'error', message: toMessage(cause), percent: undefined }, getWindow())
    })
  }, 3000)
}
