import { app, dialog } from 'electron'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import matter from 'gray-matter'
import { dirname, extname, join, resolve } from 'path'

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
  const resolvedPath = resolveMdxTarget(filePath)
  if (!resolvedPath) throw new Error(`No MDX / Markdown file found: ${filePath}`)

  const raw = readFileSync(resolvedPath, 'utf-8')
  const parsed = matter(raw)

  return {
    path: resolvedPath,
    name: resolvedPath.split(/[\\/]/).pop() ?? resolvedPath,
    frontmatter: parsed.data,
    content: parsed.content,
    raw
  }
}

export function resolveMdxTarget(inputPath: string): string | null {
  const targetPath = resolve(inputPath)
  if (!existsSync(targetPath)) return null

  const stat = statSync(targetPath)
  if (stat.isFile()) {
    return ['.md', '.mdx'].includes(extname(targetPath).toLowerCase()) ? targetPath : null
  }

  if (!stat.isDirectory()) return null

  const preferredFiles = ['README.mdx', 'README.md', 'index.mdx', 'index.md']
  for (const fileName of preferredFiles) {
    const candidate = join(targetPath, fileName)
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }

  const firstMdxFile = readdirSync(targetPath)
    .filter((fileName) => ['.mdx', '.md'].includes(extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .at(0)

  return firstMdxFile ? join(targetPath, firstMdxFile) : null
}
