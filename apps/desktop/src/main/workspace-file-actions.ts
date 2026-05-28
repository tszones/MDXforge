import { existsSync, readdirSync, renameSync, rmSync, statSync } from 'fs'
import { dirname, isAbsolute, join, relative, resolve } from 'path'
import { mainMessage } from './i18n'
import { isViewableDocumentPath } from './viewable-documents'
import {
  invalidateCompiledMdxCache,
  invalidateMdxWorkspaceCache,
  type MdxWorkspace,
  readMdxWorkspace,
  resolveMdxTarget
} from './workspace-reader'

export async function renameMdxPath(
  targetPath: string,
  nextName: string,
  workspaceRoot?: string
): Promise<MdxWorkspace> {
  const resolvedTarget = resolve(targetPath)
  if (!existsSync(resolvedTarget)) {
    throw new Error(mainMessage('error_path_not_found', { filePath: targetPath }))
  }

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
  invalidateMdxWorkspaceCache(resolvedRoot)
  invalidateCompiledMdxCache(resolvedTarget)
  const nextRoot = resolvedRoot === resolvedTarget ? nextPath : resolvedRoot
  return readMdxWorkspace(nextPath, nextRoot, { refreshFolder: true })
}

export async function deleteMdxPath(
  targetPath: string,
  workspaceRoot?: string
): Promise<MdxWorkspace | null> {
  const resolvedTarget = resolve(targetPath)
  if (!existsSync(resolvedTarget)) {
    throw new Error(mainMessage('error_path_not_found', { filePath: targetPath }))
  }

  const resolvedRoot = workspaceRoot ? resolve(workspaceRoot) : undefined
  ensurePathInsideWorkspace(resolvedTarget, resolvedRoot)

  const stat = statSync(resolvedTarget)
  if (stat.isDirectory()) {
    deleteViewableDocumentsInDirectory(resolvedTarget)
    invalidateCompiledMdxCache()
  } else {
    if (!isViewableDocumentPath(resolvedTarget)) {
      throw new Error(mainMessage('error_no_mdx_found', { filePath: targetPath }))
    }
    rmSync(resolvedTarget, { force: false })
    invalidateCompiledMdxCache(resolvedTarget)
  }

  if (!resolvedRoot || !existsSync(resolvedRoot)) return null

  invalidateMdxWorkspaceCache(resolvedRoot)
  const nextTarget = resolveMdxTarget(resolvedRoot)
  return nextTarget ? readMdxWorkspace(nextTarget, resolvedRoot, { refreshFolder: true }) : null
}

function ensurePathInsideWorkspace(targetPath: string, workspaceRoot?: string): void {
  if (!workspaceRoot) return
  const relativeTarget = relative(workspaceRoot, targetPath)
  if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
    throw new Error(mainMessage('error_path_outside_workspace', { filePath: targetPath }))
  }
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
