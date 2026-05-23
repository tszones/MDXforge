import { readFileSync } from 'fs'
import { getTextMatches, type TextSearchMatch } from '../shared/search'
import type { MdxFolderEntry } from './page-tree'

export interface MdxWorkspaceSearchResult {
  path: string
  name: string
  relativePath: string
  displayPath: string
  title?: string
  description?: string
  matches: TextSearchMatch[]
}

export function searchMdxWorkspaceFiles(
  entries: MdxFolderEntry[],
  query: string
): MdxWorkspaceSearchResult[] {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return []

  const results: MdxWorkspaceSearchResult[] = []

  for (const entry of entries) {
    let raw: string

    try {
      raw = readFileSync(entry.path, 'utf-8')
    } catch {
      continue
    }

    const matches = getTextMatches(raw, normalizedQuery, { maxMatches: 20, contextChars: 80 })
    if (matches.length === 0) continue

    const result: MdxWorkspaceSearchResult = {
      path: entry.path,
      name: entry.name,
      relativePath: entry.relativePath,
      displayPath: entry.displayPath,
      matches
    }

    if (entry.title !== undefined) result.title = entry.title
    if (entry.description !== undefined) result.description = entry.description
    results.push(result)

    if (results.length >= 100) break
  }

  return results
}
