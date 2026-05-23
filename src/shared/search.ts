export interface TextSearchMatch {
  line: number
  column: number
  preview: string
}

export interface TextSearchOptions {
  maxMatches?: number
  contextChars?: number
}

const defaultContextChars = 96
const defaultMaxMatches = 200

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase()
}

export function getTextMatches(
  source: string,
  query: string,
  options: TextSearchOptions = {}
): TextSearchMatch[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  const maxMatches = options.maxMatches ?? defaultMaxMatches
  const contextChars = options.contextChars ?? defaultContextChars
  const matches: TextSearchMatch[] = []
  const lines = source.split(/\r?\n/)

  for (const [lineIndex, line] of lines.entries()) {
    const normalizedLine = line.toLowerCase()
    let fromIndex = 0

    while (fromIndex <= normalizedLine.length) {
      const matchIndex = normalizedLine.indexOf(normalizedQuery, fromIndex)
      if (matchIndex === -1) break

      matches.push({
        line: lineIndex + 1,
        column: matchIndex + 1,
        preview: createLinePreview(line, matchIndex, normalizedQuery.length, contextChars)
      })

      if (matches.length >= maxMatches) return matches
      fromIndex = matchIndex + Math.max(normalizedQuery.length, 1)
    }
  }

  return matches
}

function createLinePreview(
  line: string,
  matchIndex: number,
  queryLength: number,
  contextChars: number
): string {
  const start = Math.max(0, matchIndex - contextChars)
  const end = Math.min(line.length, matchIndex + queryLength + contextChars)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < line.length ? '...' : ''

  return `${prefix}${line.slice(start, end).trim()}${suffix}`
}
