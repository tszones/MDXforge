import { compile } from '@mdx-js/mdx'
import { app, dialog } from 'electron'
import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs'
import matter from 'gray-matter'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'path'
import { readWorkspaceExtensionManifest, type WorkspaceExtensionManifest } from './extensions'
import { mainMessage } from './i18n'
import { remarkLocalImages } from './local-images'
import { findMdxCompileDiagnostic } from './mdx-diagnostics'
import { getMDXForgeRehypePlugins, getMDXForgeRemarkPlugins } from './mdx-options'
import { readMdxRawSource } from './mdx-raw-source'
import {
  type MdxFolder,
  type MdxFolderEntry,
  type MdxFolderTreeNode,
  readMdxFolder
} from './page-tree'
import { isViewableDocumentPath } from './viewable-documents'
import { remarkWikiLinks } from './wiki-links'

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

export async function openMdxFile(): Promise<MdxWorkspace | null> {
  const result = await dialog.showOpenDialog({
    title: mainMessage('dialog_open_mdx_file'),
    defaultPath: getLastOpenPath(),
    properties: ['openFile'],
    filters: [
      {
        name: mainMessage('dialog_filter_mdx_markdown'),
        extensions: ['mdx', 'md', 'html', 'htm', 'pdf']
      },
      { name: mainMessage('dialog_filter_all_files'), extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  setLastOpenPath(filePath)

  return readMdxWorkspace(filePath)
}

export async function openMdxFolder(): Promise<MdxWorkspace | null> {
  const result = await dialog.showOpenDialog({
    title: mainMessage('dialog_open_mdx_folder'),
    defaultPath: readState().lastOpenFolder ?? getLastOpenPath(),
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const folderPath = result.filePaths[0]
  setLastOpenFolder(folderPath)

  return readMdxWorkspace(folderPath)
}

export async function readMdxWorkspace(
  inputPath: string,
  workspaceRoot?: string
): Promise<MdxWorkspace> {
  const resolvedPath = resolve(inputPath)
  const filePath = resolveMdxTarget(resolvedPath)
  if (!filePath) throw new Error(mainMessage('error_no_mdx_found', { filePath: inputPath }))

  const folderRoot = getWorkspaceRoot(resolvedPath, filePath, workspaceRoot)
  const file = await readMdxFile(filePath, folderRoot ?? undefined)

  return {
    file,
    folder: folderRoot ? readMdxFolder(folderRoot) : undefined,
    extensions: folderRoot ? readWorkspaceExtensionManifest(folderRoot) : undefined
  }
}

export async function renameMdxPath(
  targetPath: string,
  nextName: string,
  workspaceRoot?: string
): Promise<MdxWorkspace> {
  const resolvedTarget = resolve(targetPath)
  if (!existsSync(resolvedTarget))
    throw new Error(mainMessage('error_path_not_found', { filePath: targetPath }))

  const trimmedName = nextName.trim()
  if (!trimmedName || trimmedName.includes('/') || trimmedName.includes('\\')) {
    throw new Error(mainMessage('error_invalid_file_name', { name: nextName }))
  }

  const resolvedRoot = workspaceRoot ? resolve(workspaceRoot) : undefined
  ensurePathInsideWorkspace(resolvedTarget, resolvedRoot)

  const nextPath = resolve(dirname(resolvedTarget), trimmedName)
  if (nextPath !== resolvedTarget && existsSync(nextPath)) {
    throw new Error(mainMessage('error_path_already_exists', { filePath: nextPath }))
  }

  renameSync(resolvedTarget, nextPath)
  const nextRoot = resolvedRoot === resolvedTarget ? nextPath : resolvedRoot
  return readMdxWorkspace(nextPath, nextRoot)
}

export async function deleteMdxPath(
  targetPath: string,
  workspaceRoot?: string
): Promise<MdxWorkspace | null> {
  const resolvedTarget = resolve(targetPath)
  if (!existsSync(resolvedTarget))
    throw new Error(mainMessage('error_path_not_found', { filePath: targetPath }))

  const resolvedRoot = workspaceRoot ? resolve(workspaceRoot) : undefined
  ensurePathInsideWorkspace(resolvedTarget, resolvedRoot)

  const stat = statSync(resolvedTarget)
  if (stat.isDirectory()) {
    deleteViewableDocumentsInDirectory(resolvedTarget)
  } else {
    if (!isViewableDocumentPath(resolvedTarget)) {
      throw new Error(mainMessage('error_no_mdx_found', { filePath: targetPath }))
    }
    rmSync(resolvedTarget, { force: false })
  }

  if (!resolvedRoot || !existsSync(resolvedRoot)) return null

  const nextTarget = resolveMdxTarget(resolvedRoot)
  return nextTarget ? readMdxWorkspace(nextTarget, resolvedRoot) : null
}

function ensurePathInsideWorkspace(targetPath: string, workspaceRoot?: string): void {
  if (!workspaceRoot) return
  const relativeTarget = relative(workspaceRoot, targetPath)
  if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
    throw new Error(mainMessage('error_path_outside_workspace', { filePath: targetPath }))
  }
}

function setLastOpenFolder(folderPath: string): void {
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

export async function readMdxFile(filePath: string, workspaceRoot?: string): Promise<MdxFile> {
  const resolvedPath = resolveMdxTarget(filePath)
  if (!resolvedPath) throw new Error(mainMessage('error_no_mdx_found', { filePath }))

  const fileKind = getMdxFileKind(resolvedPath)
  const raw = readMdxRawSource(resolvedPath)

  if (fileKind !== 'markdown') {
    return {
      path: resolvedPath,
      name: resolvedPath.split(/[\\/]/).pop() ?? resolvedPath,
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
      name: resolvedPath.split(/[\\/]/).pop() ?? resolvedPath,
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
      name: resolvedPath.split(/[\\/]/).pop() ?? resolvedPath,
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
      name: resolvedPath.split(/[\\/]/).pop() ?? resolvedPath,
      kind: fileKind,
      frontmatter: parsed.data,
      content: parsed.content,
      compiledSource: '',
      compileError: formatMdxError(cause, parsed.content),
      raw
    }
  }
}

function getMdxFileKind(filePath: string): MdxFileKind {
  const extension = extname(filePath).toLowerCase()
  if (extension === '.md' || extension === '.mdx') return 'markdown'
  if (extension === '.html' || extension === '.htm') return 'html'
  if (extension === '.pdf') return 'pdf'
  return 'unsupported'
}

function formatMdxError(cause: unknown, source?: string): string {
  const message = cause instanceof Error ? cause.message : String(cause)
  const diagnostic = source ? findMdxCompileDiagnostic(source) : null
  const suggestion = diagnostic
    ? `\n\n${mainMessage('error_mdx_compile_location', {
        line: diagnostic.line,
        column: diagnostic.column,
        snippet: diagnostic.snippet
      })}\n${mainMessage(
        diagnostic.kind === 'html-comment'
          ? 'error_mdx_compile_html_comment_hint'
          : 'error_mdx_compile_html_declaration_hint'
      )}`
    : ''

  return mainMessage('error_mdx_compile', { message: `${message}${suggestion}` })
}

async function compileMdxSource(
  source: string,
  localImageContext: { documentPath: string; workspaceRoot?: string }
): Promise<string> {
  return String(
    await compile(source, {
      outputFormat: 'function-body',
      development: false,
      remarkPlugins: [
        [remarkLocalImages, localImageContext],
        remarkWikiLinks,
        ...getMDXForgeRemarkPlugins()
      ],
      rehypePlugins: getMDXForgeRehypePlugins()
    })
  )
}

function getWorkspaceRoot(
  inputPath: string,
  _filePath: string,
  workspaceRoot?: string
): string | null {
  if (workspaceRoot) {
    const resolvedRoot = resolve(workspaceRoot)
    if (existsSync(resolvedRoot) && statSync(resolvedRoot).isDirectory()) return resolvedRoot
  }

  if (!existsSync(inputPath)) return null
  const stat = statSync(inputPath)
  return stat.isDirectory() ? inputPath : null
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

function deleteViewableDocumentsInDirectory(directoryPath: string): void {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      deleteViewableDocumentsInDirectory(entryPath)
      continue
    }
    if (entry.isFile() && isViewableDocumentPath(entryPath)) {
      rmSync(entryPath, { force: false })
    }
  }
}
