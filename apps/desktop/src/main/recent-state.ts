import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

const statePath = () => `${app.getPath('userData')}/state.json`

interface MdxState {
  lastOpenDir?: string
  lastOpenFile?: string
  lastOpenFolder?: string
}

function readState(): MdxState {
  try {
    return JSON.parse(readFileSync(statePath(), 'utf-8')) as MdxState
  } catch {
    return {}
  }
}

export function getLastOpenPath(): string {
  return readState().lastOpenDir ?? app.getPath('documents')
}

export function getLastOpenFolder(): string | undefined {
  return readState().lastOpenFolder
}

export function getLastOpenFile(): string | null {
  const filePath = readState().lastOpenFile
  return filePath && existsSync(filePath) ? filePath : null
}

export function setLastOpenPath(filePath: string): void {
  try {
    writeFileSync(
      statePath(),
      JSON.stringify({ lastOpenDir: dirname(filePath), lastOpenFile: filePath }, null, 2),
      'utf-8'
    )
  } catch {
    // ignore
  }
}

export function setLastOpenFolder(folderPath: string): void {
  const state = readState()
  try {
    writeFileSync(
      statePath(),
      JSON.stringify({ ...state, lastOpenFolder: folderPath, lastOpenDir: folderPath }, null, 2),
      'utf-8'
    )
  } catch {
    // ignore
  }
}
