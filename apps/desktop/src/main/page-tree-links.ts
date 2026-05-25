import { readFileSync } from 'fs'
import matter from 'gray-matter'
import { join, relative } from 'path'
import type { MdxDocumentBacklink, MdxDocumentLink, MdxFolderEntry } from './page-tree-types'
import { stripMarkdownExtension } from './page-tree-utils'

interface DocumentIndex {
  byRelativePath: Map<string, MdxFolderEntry>
  byDisplayPath: Map<string, MdxFolderEntry>
  byTitle: Map<string, MdxFolderEntry>
}

interface RawDocumentLink {
  href: string
  label: string
  wiki: boolean
}

const ambiguousDocumentEntry: MdxFolderEntry = {
  path: '',
  name: '',
  relativePath: '',
  displayPath: '',
  slug: [],
  links: [],
  backlinks: []
}

export function attachDocumentLinks(rootPath: string, entries: MdxFolderEntry[]): void {
  const index = createDocumentIndex(entries)
  const entriesByPath = new Map(entries.map((entry) => [entry.path, entry]))

  for (const entry of entries) entry.links = extractDocumentLinks(rootPath, entry, index)

  for (const entry of entries) {
    for (const link of entry.links) {
      const target = entriesByPath.get(link.targetPath)
      if (!target) continue

      const backlink: MdxDocumentBacklink = {
        sourcePath: entry.path,
        sourceRelativePath: entry.relativePath,
        sourceDisplayPath: entry.displayPath,
        label: link.label,
        href: link.href
      }

      if (entry.title !== undefined) backlink.sourceTitle = entry.title
      target.backlinks.push(backlink)
    }
  }

  for (const entry of entries) {
    entry.backlinks.sort((a, b) => {
      const sourceOrder = a.sourceDisplayPath.localeCompare(b.sourceDisplayPath)
      return sourceOrder === 0 ? a.label.localeCompare(b.label) : sourceOrder
    })
  }
}

function createDocumentIndex(entries: MdxFolderEntry[]): DocumentIndex {
  const index: DocumentIndex = {
    byRelativePath: new Map(),
    byDisplayPath: new Map(),
    byTitle: new Map()
  }

  for (const entry of entries) {
    addUniqueIndexValue(index.byRelativePath, normalizeDocumentLinkKey(entry.relativePath), entry)
    addUniqueIndexValue(
      index.byRelativePath,
      normalizeDocumentLinkKey(stripMarkdownExtension(entry.relativePath)),
      entry
    )
    addUniqueIndexValue(index.byDisplayPath, normalizeDocumentLinkKey(entry.displayPath), entry)
    addUniqueIndexValue(index.byDisplayPath, normalizeDocumentLinkKey(entry.slug.join('/')), entry)

    if (entry.title)
      addUniqueIndexValue(index.byTitle, normalizeDocumentLinkKey(entry.title), entry)
  }

  return index
}

function addUniqueIndexValue(
  index: Map<string, MdxFolderEntry>,
  key: string,
  entry: MdxFolderEntry
): void {
  if (!key) return

  const existing = index.get(key)
  index.set(key, existing && existing.path !== entry.path ? ambiguousDocumentEntry : entry)
}

function extractDocumentLinks(
  rootPath: string,
  source: MdxFolderEntry,
  index: DocumentIndex
): MdxDocumentLink[] {
  const content = readMdxContent(source.path)
  const rawLinks = findRawDocumentLinks(maskMarkdownCode(content))
  const output: MdxDocumentLink[] = []
  const seen = new Set<string>()

  for (const rawLink of rawLinks) {
    const target = resolveDocumentLink(rootPath, source, rawLink.href, rawLink.wiki, index)
    if (!target || target.path === source.path) continue

    const key = `${target.path}\n${rawLink.href}\n${rawLink.label}`
    if (seen.has(key)) continue
    seen.add(key)

    const link: MdxDocumentLink = {
      href: rawLink.href,
      label: rawLink.label,
      targetPath: target.path,
      targetRelativePath: target.relativePath,
      targetDisplayPath: target.displayPath
    }

    if (target.title !== undefined) link.targetTitle = target.title
    output.push(link)
  }

  return output
}

function readMdxContent(filePath: string): string {
  try {
    return matter(readFileSync(filePath, 'utf-8')).content
  } catch {
    return ''
  }
}

function findRawDocumentLinks(content: string): RawDocumentLink[] {
  const links: RawDocumentLink[] = []
  const markdownLinkPattern = /(?<!!)\[([^\]\n]+)\]\(([^)\n]+)\)/g
  const wikiLinkPattern = /\[\[([^\]\n|]+)(?:\|([^\]\n]+))?\]\]/g

  for (const match of content.matchAll(markdownLinkPattern)) {
    const label = cleanMarkdownLinkLabel(match[1] ?? '')
    const href = cleanMarkdownLinkHref(match[2] ?? '')
    if (label && href) links.push({ href, label, wiki: false })
  }

  for (const match of content.matchAll(wikiLinkPattern)) {
    const href = (match[1] ?? '').trim()
    const label = (match[2] ?? match[1] ?? '').trim()
    if (href && label) links.push({ href, label, wiki: true })
  }

  return links
}

function cleanMarkdownLinkLabel(label: string): string {
  return label.replace(/\s+/g, ' ').trim()
}

function cleanMarkdownLinkHref(href: string): string {
  const trimmed = href.trim()
  if (trimmed.startsWith('<')) {
    const end = trimmed.indexOf('>')
    return end === -1 ? '' : trimmed.slice(1, end).trim()
  }

  const quotedTitle = trimmed.search(/\s+["'(]/)
  return quotedTitle === -1 ? trimmed : trimmed.slice(0, quotedTitle).trim()
}

function maskMarkdownCode(content: string): string {
  return content
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/^~~~[\s\S]*?^~~~/gm, '')
    .replace(/`[^`\n]*`/g, '')
}

function resolveDocumentLink(
  rootPath: string,
  source: MdxFolderEntry,
  href: string,
  wiki: boolean,
  index: DocumentIndex
): MdxFolderEntry | null {
  const split = splitDocumentHref(href)
  if (!split || isExternalDocumentHref(split.path)) return null

  const pathTarget = resolveDocumentPathTarget(rootPath, source, split.path, index)
  if (pathTarget) return pathTarget

  if (!wiki) return null

  const displayKey = normalizeDocumentLinkKey(split.path)
  return (
    getUnambiguousIndexValue(index.byDisplayPath, displayKey) ??
    getUnambiguousIndexValue(index.byTitle, displayKey)
  )
}

function resolveDocumentPathTarget(
  rootPath: string,
  source: MdxFolderEntry,
  hrefPath: string,
  index: DocumentIndex
): MdxFolderEntry | null {
  const decodedPath = decodeDocumentHrefPath(hrefPath)
  if (!decodedPath) return null

  const relativeTarget = normalizeRelativeDocumentTarget(rootPath, source, decodedPath)
  if (!relativeTarget) return null

  return findRelativeDocumentTarget(index, relativeTarget)
}

function normalizeRelativeDocumentTarget(
  rootPath: string,
  source: MdxFolderEntry,
  hrefPath: string
): string | null {
  if (hrefPath.startsWith('/')) return hrefPath.slice(1)

  if (hrefPath.startsWith('./') || hrefPath.startsWith('../')) {
    return relative(rootPath, join(rootPath, source.relativePath, '..', hrefPath)).replace(
      /\\/g,
      '/'
    )
  }

  return hrefPath.replace(/\\/g, '/')
}

function findRelativeDocumentTarget(
  index: DocumentIndex,
  relativeTarget: string
): MdxFolderEntry | null {
  const key = normalizeDocumentLinkKey(relativeTarget)
  if (!key) return null

  return (
    getUnambiguousIndexValue(index.byRelativePath, key) ??
    getUnambiguousIndexValue(index.byRelativePath, `${key}/index`) ??
    getUnambiguousIndexValue(index.byRelativePath, `${key}/README`) ??
    getUnambiguousIndexValue(index.byDisplayPath, key)
  )
}

function getUnambiguousIndexValue(
  index: Map<string, MdxFolderEntry>,
  key: string
): MdxFolderEntry | null {
  const entry = index.get(key)
  return entry?.path ? entry : null
}

function splitDocumentHref(href: string): { path: string; suffix: string } | null {
  const trimmed = href.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  const hashIndex = trimmed.indexOf('#')
  const beforeHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : trimmed.slice(hashIndex)
  const queryIndex = beforeHash.indexOf('?')

  if (queryIndex === -1) return { path: beforeHash, suffix: hash }

  return {
    path: beforeHash.slice(0, queryIndex),
    suffix: `${beforeHash.slice(queryIndex)}${hash}`
  }
}

function decodeDocumentHrefPath(hrefPath: string): string | null {
  try {
    return decodeURIComponent(hrefPath)
  } catch {
    return null
  }
}

function isExternalDocumentHref(hrefPath: string): boolean {
  return (
    hrefPath.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(hrefPath) ||
    /^[a-zA-Z]:[\\/]/.test(hrefPath)
  )
}

function normalizeDocumentLinkKey(value: string): string {
  return stripMarkdownExtension(value)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .trim()
    .toLowerCase()
}
