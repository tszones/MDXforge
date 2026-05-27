import { extname } from 'path'

export const defaultViewableDocumentExtensions = ['.md', '.mdx', '.html', '.htm', '.pdf'] as const

export function normalizeDocumentExtension(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null
  const extension = trimmed.startsWith('.') ? trimmed : `.${trimmed}`
  return /^\.[a-z0-9]+$/.test(extension) ? extension : null
}

export function normalizeViewableDocumentExtensions(value: unknown): string[] {
  if (!Array.isArray(value)) return [...defaultViewableDocumentExtensions]

  const extensions = value.flatMap((item) => {
    if (typeof item !== 'string') return []
    const extension = normalizeDocumentExtension(item)
    return extension ? [extension] : []
  })

  return Array.from(new Set(extensions)).sort((a, b) => a.localeCompare(b))
}

export function isViewableDocumentPath(filePath: string, extensions: readonly string[]): boolean {
  return new Set(extensions).has(extname(filePath).toLowerCase())
}
