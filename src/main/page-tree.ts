import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import matter from 'gray-matter'
import { extname, join, relative } from 'path'

export interface MdxFolderEntry {
  path: string
  name: string
  relativePath: string
  displayPath: string
  slug: string[]
  title?: string
  description?: string
  icon?: string
}

export type MdxFolderTreeNode =
  | { type: 'file'; path: string }
  | {
      type: 'folder'
      name: string
      path: string
      description?: string
      icon?: string
      root?: boolean
      defaultOpen?: boolean
      collapsible?: boolean
      children: MdxFolderTreeNode[]
    }
  | { type: 'separator'; label: string; icon?: string }
  | { type: 'link'; label: string; href: string; external?: boolean; icon?: string }

export interface MdxFolder {
  rootPath: string
  name: string
  description?: string
  icon?: string
  root?: boolean
  files: MdxFolderEntry[]
  tree: MdxFolderTreeNode[]
}

interface MetaFile {
  title?: string
  description?: string
  icon?: string
  root?: boolean
  pages?: string[]
  defaultOpen?: boolean
  collapsible?: boolean
}

interface FolderScan {
  absolutePath: string
  relativePath: string
  displayPath: string
  name: string
  meta: MetaFile
  files: PageFile[]
  folders: FolderScan[]
}

interface PageFile {
  path: string
  name: string
  stem: string
  relativePath: string
  displayPath: string
  slug: string[]
  title?: string
  description?: string
  icon?: string
}

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'out'])
const markdownExtensions = new Set(['.md', '.mdx'])

export function readMdxFolder(rootPath: string): MdxFolder {
  const root = scanFolder(rootPath, '', '')
  const files = flattenFiles(root)
  const folder: MdxFolder = {
    rootPath,
    name: root.meta.title ?? root.name,
    files,
    tree: buildFolderChildren(root)
  }

  assignFolderMetadata(folder, root.meta)
  return folder
}

function scanFolder(absolutePath: string, relativePath: string, displayPath: string): FolderScan {
  const meta = readMetaFile(absolutePath)
  const folderName = absolutePath.split(/[\\/]/).filter(Boolean).at(-1) ?? absolutePath
  const name = meta.title ?? cleanSegmentName(folderName)
  const files: PageFile[] = []
  const folders: FolderScan[] = []
  const entries = readdirSync(absolutePath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.vitepress') continue
    if (ignoredDirectories.has(entry.name)) continue
    if (entry.isFile() && entry.name === 'meta.json') continue

    const childAbsolutePath = join(absolutePath, entry.name)
    const childRelativePath = joinPath(relativePath, entry.name)

    if (entry.isDirectory()) {
      const childDisplayPath = isGroupFolder(entry.name)
        ? displayPath
        : joinPath(displayPath, cleanSegmentName(entry.name))

      folders.push(scanFolder(childAbsolutePath, childRelativePath, childDisplayPath))
      continue
    }

    if (!entry.isFile() || !markdownExtensions.has(extname(entry.name).toLowerCase())) continue

    const stem = stripMarkdownExtension(entry.name)
    if (isLocaleVariantStem(stem)) continue

    const displayStem = isIndexStem(stem) ? '' : cleanSegmentName(stem)
    const fileDisplayPath = joinPath(displayPath, displayStem)
    const metadata = readMdxMetadata(childAbsolutePath)

    files.push({
      path: childAbsolutePath,
      name: entry.name,
      stem,
      relativePath: childRelativePath,
      displayPath: fileDisplayPath || 'index',
      slug: fileDisplayPath ? fileDisplayPath.split('/') : [],
      title: metadata.title,
      description: metadata.description,
      icon: metadata.icon
    })
  }

  return { absolutePath, relativePath, displayPath, name, meta, files, folders }
}

function flattenFiles(folder: FolderScan): MdxFolderEntry[] {
  const files = orderItems(folder)
    .filter((item) => item.type !== 'separator' && item.type !== 'link')
    .flatMap((item) => {
      if (item.type === 'file') return [item.file]
      return flattenFiles(item.folder)
    })

  return files.map((file) => {
    const entry: MdxFolderEntry = {
      path: file.path,
      name: file.name,
      relativePath: file.relativePath,
      displayPath: file.displayPath,
      slug: file.slug
    }

    if (file.title !== undefined) entry.title = file.title
    if (file.description !== undefined) entry.description = file.description
    if (file.icon !== undefined) entry.icon = file.icon

    return entry
  })
}

function buildFolderChildren(folder: FolderScan): MdxFolderTreeNode[] {
  return orderItems(folder).flatMap((item): MdxFolderTreeNode[] => {
    if (item.type === 'separator') {
      const separator: Extract<MdxFolderTreeNode, { type: 'separator' }> = {
        type: 'separator',
        label: item.label
      }
      if (item.icon !== undefined) separator.icon = item.icon
      return [separator]
    }

    if (item.type === 'link') {
      const link: Extract<MdxFolderTreeNode, { type: 'link' }> = {
        type: 'link',
        label: item.label,
        href: item.href
      }
      if (item.external !== undefined) link.external = item.external
      if (item.icon !== undefined) link.icon = item.icon
      return [link]
    }

    if (item.type === 'file') return [{ type: 'file', path: item.file.path }]

    const children = buildFolderChildren(item.folder)
    if (isGroupFolder(item.folder.relativePath.split('/').at(-1) ?? '')) return children
    if (children.length === 0) return []

    const indexFile = item.folder.files.find((file) => isIndexStem(file.stem))
    const folderPath = item.folder.displayPath || item.folder.relativePath
    const folderNode: Extract<MdxFolderTreeNode, { type: 'folder' }> = {
      type: 'folder',
      name: item.folder.meta.title ?? item.folder.name,
      path: folderPath,
      children: indexFile
        ? [
            { type: 'file', path: indexFile.path },
            ...children.filter((child) => child.type !== 'file' || child.path !== indexFile.path)
          ]
        : children
    }

    assignFolderMetadata(folderNode, item.folder.meta)
    if (item.folder.meta.defaultOpen !== undefined)
      folderNode.defaultOpen = item.folder.meta.defaultOpen
    if (item.folder.meta.collapsible !== undefined)
      folderNode.collapsible = item.folder.meta.collapsible

    return [folderNode]
  })
}

function assignFolderMetadata(
  folder: MdxFolder | Extract<MdxFolderTreeNode, { type: 'folder' }>,
  meta: MetaFile
): void {
  if (meta.description !== undefined) folder.description = meta.description
  if (meta.icon !== undefined) folder.icon = meta.icon
  if (meta.root !== undefined) folder.root = meta.root
}

type OrderedItem =
  | { type: 'file'; key: string; file: PageFile }
  | { type: 'folder'; key: string; folder: FolderScan }
  | { type: 'separator'; key: string; label: string; icon?: string }
  | { type: 'link'; key: string; label: string; href: string; external?: boolean; icon?: string }

function orderItems(folder: FolderScan): OrderedItem[] {
  const available = getAvailableItems(folder)
  const pages = folder.meta.pages
  if (!pages || pages.length === 0) return available

  const output: OrderedItem[] = []
  const used = new Set<string>()
  const excluded = new Set(
    pages.filter((page) => page.startsWith('!')).map((page) => normalizePageKey(page.slice(1)))
  )

  for (const page of pages) {
    if (page.startsWith('!')) continue

    if (page.startsWith('...') && page !== '...' && page !== 'z...a') {
      const folderItem = findReferencedItem(folder, page.slice(3))
      if (folderItem?.type !== 'folder') continue

      output.push(...orderItems(folderItem.folder))
      used.add(itemIdentityKey(folderItem))
      continue
    }

    const special = parseSpecialPage(page)
    if (special) {
      output.push(special)
      continue
    }

    if (page === '...' || page === 'z...a') {
      const rest = available.filter(
        (item) => !used.has(itemIdentityKey(item)) && !excluded.has(item.key)
      )
      output.push(...(page === 'z...a' ? rest.reverse() : rest))
      for (const item of rest) used.add(itemIdentityKey(item))
      continue
    }

    const item = findReferencedItem(folder, page)
    if (!item || excluded.has(item.key) || used.has(itemIdentityKey(item))) continue

    output.push(item)
    used.add(itemIdentityKey(item))
    markReferencedAncestorsUsed(used, folder, page)
  }

  return output
}

function getAvailableItems(folder: FolderScan): OrderedItem[] {
  return [
    ...folder.files.map((file) => ({ type: 'file' as const, key: fileKey(file), file })),
    ...folder.folders.map((child) => ({
      type: 'folder' as const,
      key: childKey(child),
      folder: child
    }))
  ].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.key.localeCompare(b.key)
  })
}

function parseSpecialPage(page: string): OrderedItem | null {
  const separator = page.match(/^---(?:\[([^\]]+)\])?(.*?)---$/)
  if (separator) {
    const label = separator[2]?.trim()
    return label
      ? { type: 'separator', key: `separator:${label}`, label, icon: separator[1] }
      : null
  }

  const link = page.match(/^(external:)?(?:\[([^\]]+)\])?\[(.+?)\]\((.+?)\)$/)
  if (link) {
    return {
      type: 'link',
      key: `link:${link[4]}`,
      label: link[3] ?? link[4] ?? '',
      href: link[4] ?? '',
      external: Boolean(link[1]),
      icon: link[2]
    }
  }

  return null
}

function findReferencedItem(folder: FolderScan, page: string): OrderedItem | null {
  const key = normalizePageKey(page)
  if (!key) return null

  const direct = getAvailableItems(folder).find((item) => item.key === key)
  if (direct) return direct

  const [head, ...rest] = key.split('/')
  if (!head || rest.length === 0) return null

  const child = folder.folders.find((child) => childKey(child) === head)
  if (!child) return null

  return findReferencedItem(child, rest.join('/'))
}

function itemIdentityKey(item: OrderedItem): string {
  if (item.type === 'file') return `file:${item.file.path}`
  if (item.type === 'folder') return `folder:${item.folder.absolutePath}`
  return item.key
}

function markReferencedAncestorsUsed(used: Set<string>, folder: FolderScan, page: string): void {
  const [head, ...rest] = normalizePageKey(page).split('/')
  if (!head || rest.length === 0) return

  const ancestor = getAvailableItems(folder).find(
    (item) => item.type === 'folder' && item.key === head
  )
  if (ancestor) used.add(itemIdentityKey(ancestor))
}

function fileKey(file: PageFile): string {
  return isIndexStem(file.stem) ? 'index' : cleanSegmentName(file.stem)
}

function childKey(folder: FolderScan): string {
  return cleanSegmentName(folder.relativePath.split('/').at(-1) ?? folder.name)
}

function normalizePageKey(page: string): string {
  return page
    .replace(/^\.\//, '')
    .replace(/\.(mdx|md|json)$/i, '')
    .split('/')
    .map(cleanSegmentName)
    .join('/')
}

function readMetaFile(folderPath: string): MetaFile {
  const filePath = join(folderPath, 'meta.json')
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return {}

  try {
    const value = JSON.parse(readFileSync(filePath, 'utf-8')) as MetaFile
    return typeof value === 'object' && value !== null ? value : {}
  } catch {
    return {}
  }
}

function readMdxMetadata(filePath: string): Pick<PageFile, 'title' | 'description' | 'icon'> {
  try {
    const parsed = matter(readFileSync(filePath, 'utf-8'))
    return {
      title: typeof parsed.data.title === 'string' ? parsed.data.title : undefined,
      description:
        typeof parsed.data.description === 'string' ? parsed.data.description : undefined,
      icon: typeof parsed.data.icon === 'string' ? parsed.data.icon : undefined
    }
  } catch {
    return {}
  }
}

function stripMarkdownExtension(fileName: string): string {
  return fileName.replace(/\.(mdx|md)$/i, '')
}

function isIndexStem(stem: string): boolean {
  return stem === 'index' || stem === 'README'
}

function isLocaleVariantStem(stem: string): boolean {
  return /\.(cn|zh|zh-CN|en|en-US)$/.test(stem)
}

function isGroupFolder(name: string): boolean {
  return name.startsWith('(') && name.endsWith(')')
}

function cleanSegmentName(name: string): string {
  return isGroupFolder(name) ? name.slice(1, -1) : name
}

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replace(/\\/g, '/')
}

export function toRelativeDisplayPath(rootPath: string, filePath: string): string {
  const relativePath = relative(rootPath, filePath).replace(/\\/g, '/')
  const parts = relativePath.split('/')
  const fileName = parts.pop()
  if (!fileName) return relativePath

  const stem = stripMarkdownExtension(fileName)
  const displayParts = parts.filter((part) => !isGroupFolder(part)).map(cleanSegmentName)
  if (!isIndexStem(stem)) displayParts.push(cleanSegmentName(stem))

  return displayParts.join('/') || 'index'
}
