import { statSync } from 'fs'
import type { MdxFile } from './workspace-reader'

const mdxCompileCacheVersion = 'mdxforge-mdx-options-v1'
const maxCompiledMdxCacheEntries = 50

type CompiledMdxCacheEntry = {
  key: string
  file: MdxFile
}

const compiledMdxCache = new Map<string, CompiledMdxCacheEntry>()

export function getCompiledMdxCacheKey(filePath: string, workspaceRoot?: string): string {
  const stat = statSync(filePath)
  return [filePath, stat.mtimeMs, stat.size, workspaceRoot ?? '', mdxCompileCacheVersion].join('\n')
}

export function getCompiledMdxCacheEntry(key: string): MdxFile | null {
  const entry = compiledMdxCache.get(key)
  if (!entry) return null

  compiledMdxCache.delete(key)
  compiledMdxCache.set(key, entry)
  return entry.file
}

export function setCompiledMdxCacheEntry(key: string, file: MdxFile): void {
  compiledMdxCache.set(key, { key, file })

  while (compiledMdxCache.size > maxCompiledMdxCacheEntries) {
    const oldestKey = compiledMdxCache.keys().next().value
    if (!oldestKey) break
    compiledMdxCache.delete(oldestKey)
  }
}

export function invalidateCompiledMdxCache(filePath?: string): void {
  if (!filePath) {
    compiledMdxCache.clear()
    return
  }

  for (const [key, entry] of compiledMdxCache) {
    if (entry.file.path === filePath || key.startsWith(`${filePath}\n`)) {
      compiledMdxCache.delete(key)
    }
  }
}
