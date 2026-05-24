import type { MdxFolderEntry } from '../../types'

export function buildDocumentLinkMap(
  entry: MdxFolderEntry | undefined
): Map<string, MdxFolderEntry['links'][number]> {
  const links = new Map<string, MdxFolderEntry['links'][number]>()

  for (const link of entry?.links ?? []) {
    links.set(normalizeDocumentHref(link.href), link)
  }

  return links
}

export function normalizeDocumentHref(href: string): string {
  const trimmed = href.trim()
  const hashIndex = trimmed.indexOf('#')
  const beforeHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex)
  const queryIndex = beforeHash.indexOf('?')
  const withoutSuffix = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)

  try {
    return decodeURIComponent(withoutSuffix)
  } catch {
    return withoutSuffix
  }
}

export function shouldUseNativeLinkClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}
