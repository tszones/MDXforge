export function stripMarkdownExtension(fileName: string): string {
  return fileName.replace(/\.(mdx|md)$/i, '')
}

export function isIndexStem(stem: string): boolean {
  return stem === 'index' || stem === 'README'
}

export function isLocaleVariantStem(stem: string): boolean {
  return /\.(cn|zh|zh-CN|en|en-US)$/.test(stem)
}

export function isGroupFolder(name: string): boolean {
  return name.startsWith('(') && name.endsWith(')')
}

export function cleanSegmentName(name: string): string {
  return isGroupFolder(name) ? name.slice(1, -1) : name
}

export function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replace(/\\/g, '/')
}

export function normalizePageKey(page: string): string {
  return page
    .replace(/^\.\//, '')
    .replace(/\.(mdx|md|json)$/i, '')
    .split('/')
    .map(cleanSegmentName)
    .join('/')
}
