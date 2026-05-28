import { existsSync, readdirSync, statSync } from 'fs'
import matter from 'gray-matter'
import { extname, join, resolve } from 'path'
import { readWorkspaceExtensionManifest, type WorkspaceExtensionManifest } from './extensions'
import { mainMessage } from './i18n'
import { compileMdxSource, formatMdxError } from './mdx-compiler'
import { readMdxRawSource } from './mdx-raw-source'
import {
  type MdxFolder,
  type MdxFolderEntry,
  type MdxFolderTreeNode,
  readMdxFolder
} from './page-tree'
import { isViewableDocumentPath } from './viewable-documents'

export interface MdxFile {
  path: string
  name: string
  kind: MdxFileKind
  frontmatter: Record<string, unknown>
  content: string
  compiledSource: string
  compileError?: string
  raw: string
}

export type MdxFolderKind = 'markdown' | 'html' | 'pdf' | 'unsupported'
export type MdxFileKind = MdxFolderKind

export type { MdxFolder, MdxFolderEntry, MdxFolderTreeNode }

export interface MdxWorkspace {
  file: MdxFile
  folder?: MdxFolder
  extensions?: WorkspaceExtensionManifest
}

export interface ReadMdxWorkspaceOptions {
  refreshFolder?: boolean
}

type WorkspaceCache = {
  rootPath: string
  folder: MdxFolder
  extensions: WorkspaceExtensionManifest | undefined
}

let workspaceCache: WorkspaceCache | null = null

export function invalidateMdxWorkspaceCache(workspaceRoot?: string): void {
  if (!workspaceRoot || workspaceCache?.rootPath === resolve(workspaceRoot)) workspaceCache = null
}

export async function readMdxWorkspace(
  inputPath: string,
  workspaceRoot?: string,
  options: ReadMdxWorkspaceOptions = {}
): Promise<MdxWorkspace> {
  const { refreshFolder = true } = options
  const resolvedPath = resolve(inputPath)
  const filePath = resolveMdxTarget(resolvedPath)
  if (!filePath) throw new Error(mainMessage('error_no_mdx_found', { filePath: inputPath }))

  const folderRoot = getWorkspaceRoot(resolvedPath, workspaceRoot)
  const file = await readMdxFile(filePath, folderRoot ?? undefined)
  const cachedWorkspace = folderRoot ? getCachedWorkspace(folderRoot, refreshFolder) : null

  return {
    file,
    folder: cachedWorkspace?.folder,
    extensions: cachedWorkspace?.extensions
  }
}

export async function readMdxFile(filePath: string, workspaceRoot?: string): Promise<MdxFile> {
  const resolvedPath = resolveMdxTarget(filePath)
  if (!resolvedPath) throw new Error(mainMessage('error_no_mdx_found', { filePath }))

  const fileKind = getMdxFileKind(resolvedPath)
  const raw = readMdxRawSource(resolvedPath)

  if (fileKind !== 'markdown') {
    return {
      path: resolvedPath,
      name: getFileName(resolvedPath),
      kind: fileKind,
      frontmatter: {},
      content: raw,
      compiledSource: '',
      raw
    }
  }

  let parsed: matter.GrayMatterFile<string>

  try {
    parsed = matter(raw)
  } catch (cause) {
    return {
      path: resolvedPath,
      name: getFileName(resolvedPath),
      kind: fileKind,
      frontmatter: {},
      content: raw,
      compiledSource: '',
      compileError: formatMdxError(cause, raw),
      raw
    }
  }

  try {
    return {
      path: resolvedPath,
      name: getFileName(resolvedPath),
      kind: fileKind,
      frontmatter: parsed.data,
      content: parsed.content,
      compiledSource: await compileMdxSource(parsed.content, {
        documentPath: resolvedPath,
        workspaceRoot
      }),
      raw
    }
  } catch (cause) {
    return {
      path: resolvedPath,
      name: getFileName(resolvedPath),
      kind: fileKind,
      frontmatter: parsed.data,
      content: parsed.content,
      compiledSource: '',
      compileError: formatMdxError(cause, parsed.content),
      raw
    }
  }
}

export function resolveMdxTarget(inputPath: string): string | null {
  const targetPath = resolve(inputPath)
  if (!existsSync(targetPath)) return null

  const stat = statSync(targetPath)
  if (stat.isFile()) {
    return isViewableDocumentPath(targetPath) ? targetPath : null
  }

  if (!stat.isDirectory()) return null

  const preferredFiles = ['README.mdx', 'README.md', 'index.mdx', 'index.md']
  for (const fileName of preferredFiles) {
    const candidate = join(targetPath, fileName)
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }

  const firstMdxFile = readdirSync(targetPath)
    .filter((fileName) => isViewableDocumentPath(fileName))
    .sort((a, b) => a.localeCompare(b))
    .at(0)

  return firstMdxFile ? join(targetPath, firstMdxFile) : null
}

function getWorkspaceRoot(inputPath: string, workspaceRoot?: string): string | null {
  if (workspaceRoot) {
    const resolvedRoot = resolve(workspaceRoot)
    if (existsSync(resolvedRoot) && statSync(resolvedRoot).isDirectory()) return resolvedRoot
  }

  if (!existsSync(inputPath)) return null
  const stat = statSync(inputPath)
  return stat.isDirectory() ? inputPath : null
}

function getCachedWorkspace(folderRoot: string, refreshFolder: boolean): WorkspaceCache {
  const rootPath = resolve(folderRoot)
  const cachedWorkspace = workspaceCache
  if (!refreshFolder && cachedWorkspace?.rootPath === rootPath) return cachedWorkspace

  workspaceCache = {
    rootPath,
    folder: readMdxFolder(rootPath),
    extensions: readWorkspaceExtensionManifest(rootPath)
  }
  return workspaceCache
}

function getMdxFileKind(filePath: string): MdxFileKind {
  const extension = extname(filePath).toLowerCase()
  if (extension === '.md' || extension === '.mdx') return 'markdown'
  if (extension === '.html' || extension === '.htm') return 'html'
  if (extension === '.pdf') return 'pdf'
  return 'unsupported'
}

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath
}
