import { getTextMatches, normalizeSearchText, type TextSearchMatch } from '../../../shared/search'
import type { MdxFolderEntry } from '../types'

export type { TextSearchMatch }

export function filterFileEntries(entries: MdxFolderEntry[], query: string): MdxFolderEntry[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  return entries
    .filter((entry) => getEntrySearchText(entry).includes(normalizedQuery))
    .sort((a, b) => scoreEntry(b, normalizedQuery) - scoreEntry(a, normalizedQuery))
    .slice(0, 80)
}

export { getTextMatches, normalizeSearchText }

function getEntrySearchText(entry: MdxFolderEntry): string {
  return normalizeSearchText(
    [entry.title, entry.description, entry.displayPath, entry.relativePath, entry.name]
      .filter(Boolean)
      .join(' ')
  )
}

function scoreEntry(entry: MdxFolderEntry, query: string): number {
  const title = normalizeSearchText(entry.title ?? '')
  const displayPath = normalizeSearchText(entry.displayPath)
  const relativePath = normalizeSearchText(entry.relativePath)
  const name = normalizeSearchText(entry.name)

  if (title === query || displayPath === query || name === query) return 100
  if (title.startsWith(query) || displayPath.startsWith(query) || name.startsWith(query)) return 80
  if (relativePath.startsWith(query)) return 70
  if (title.includes(query)) return 50
  if (displayPath.includes(query) || relativePath.includes(query) || name.includes(query)) return 40
  return 10
}
