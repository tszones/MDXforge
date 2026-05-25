import type { FolderScan, OrderedItem, PageFile } from './page-tree-types'
import { cleanSegmentName, isIndexStem, normalizePageKey } from './page-tree-utils'

export function orderItems(folder: FolderScan): OrderedItem[] {
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
