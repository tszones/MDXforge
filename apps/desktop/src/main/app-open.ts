import type { BrowserWindow } from 'electron'
import { type FSWatcher, watch } from 'fs'
import { resolve } from 'path'
import { IpcChannels } from '../shared/ipc'
import type { WorkspaceExtensionManifest } from './extensions'
import {
  invalidateMdxWorkspaceCache,
  readMdxWorkspace,
  resolveMdxTarget,
  setLastOpenPath
} from './mdx'

export type SetExtensionManifest = (manifest: WorkspaceExtensionManifest | null) => void

let mdxWatcher: FSWatcher | null = null
let mdxWatchTimer: NodeJS.Timeout | null = null
let watchedMdxPath: string | null = null
let watchedWorkspaceRoot: string | undefined
let watchedOpenedPath: string | null = null
let notifyWindow: BrowserWindow | null = null
let setCurrentExtensionManifest: SetExtensionManifest | null = null

export function getMdxPathFromArgv(argv: string[]): string | null {
  return (
    argv
      .filter((arg) => !arg.startsWith('-'))
      .map((arg) => resolveMdxTarget(resolve(arg)))
      .find((filePath) => filePath !== null) ?? null
  )
}

export async function openMdxPath(
  filePath: string,
  window: BrowserWindow | null,
  setManifest: SetExtensionManifest
): Promise<void> {
  if (!window) return

  try {
    const workspace = await readMdxWorkspace(filePath)
    setManifest(workspace.extensions ?? null)
    setLastOpenPath(workspace.file.path)
    invalidateMdxWorkspaceCache(workspace.folder?.rootPath)
    watchMdxWorkspace(filePath, workspace.folder?.rootPath, window, setManifest)
    window.webContents.send(IpcChannels.mdx.fileOpened, workspace)
  } catch (cause) {
    window.webContents.send(
      IpcChannels.mdx.fileOpenError,
      cause instanceof Error ? cause.message : String(cause)
    )
  }
}

export function watchMdxWorkspace(
  openedPath: string,
  workspaceRoot: string | undefined,
  window: BrowserWindow,
  setManifest: SetExtensionManifest
): void {
  notifyWindow = window
  setCurrentExtensionManifest = setManifest
  const watchPath = workspaceRoot ?? openedPath
  if (watchedMdxPath === watchPath) {
    watchedOpenedPath = openedPath
    watchedWorkspaceRoot = workspaceRoot
    return
  }

  mdxWatcher?.close()
  mdxWatcher = null
  watchedMdxPath = watchPath
  watchedOpenedPath = openedPath
  watchedWorkspaceRoot = workspaceRoot

  try {
    mdxWatcher = watch(watchPath, { recursive: true }, () => scheduleMdxReload())
  } catch {
    try {
      mdxWatcher = watch(watchPath, () => scheduleMdxReload())
    } catch {
      watchedMdxPath = null
      watchedOpenedPath = null
      watchedWorkspaceRoot = undefined
    }
  }
}

function scheduleMdxReload(): void {
  if (mdxWatchTimer) clearTimeout(mdxWatchTimer)
  mdxWatchTimer = setTimeout(() => {
    void reloadWatchedMdxWorkspace()
  }, 250)
}

async function reloadWatchedMdxWorkspace(): Promise<void> {
  if (!notifyWindow || !watchedOpenedPath || !setCurrentExtensionManifest) return

  try {
    invalidateMdxWorkspaceCache(watchedWorkspaceRoot)
    const workspace = await readMdxWorkspace(watchedOpenedPath, watchedWorkspaceRoot, {
      refreshFolder: true
    })
    setCurrentExtensionManifest(workspace.extensions ?? null)
    notifyWindow.webContents.send(IpcChannels.mdx.fileChanged, workspace)
  } catch (cause) {
    notifyWindow.webContents.send(
      IpcChannels.mdx.fileChangeError,
      cause instanceof Error ? cause.message : String(cause)
    )
  }
}
