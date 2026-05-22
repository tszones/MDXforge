import { app, dialog } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import matter from 'gray-matter'
import { dirname } from 'path'

const statePath = () => `${app.getPath('userData')}/state.json`

interface MdxState {
  lastOpenDir?: string
  lastOpenFile?: string
}

function readState(): MdxState {
  try {
    return JSON.parse(readFileSync(statePath(), 'utf-8')) as MdxState
  } catch {
    return {}
  }
}

function getLastOpenPath(): string {
  return readState().lastOpenDir ?? app.getPath('documents')
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

export interface MdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  content: string
  raw: string
}

export async function openMdxFile(): Promise<MdxFile | null> {
  const result = await dialog.showOpenDialog({
    title: 'Open MDX file',
    defaultPath: getLastOpenPath(),
    properties: ['openFile'],
    filters: [
      { name: 'MDX / Markdown', extensions: ['mdx', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  setLastOpenPath(filePath)

  return readMdxFile(filePath)
}

export async function readMdxFile(filePath: string): Promise<MdxFile> {
  const raw = readFileSync(filePath, 'utf-8')
  const parsed = matter(raw)

  return {
    path: filePath,
    name: filePath.split(/[\\/]/).pop() ?? filePath,
    frontmatter: parsed.data,
    content: parsed.content,
    raw
  }
}
