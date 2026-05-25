import type { FolderScan, MetaFile, MdxFolder, MdxFolderEntry, MdxFolderTreeNode } from './page-tree-types'
import { orderItems } from './page-tree-order'
import { isGroupFolder } from './page-tree-utils'

export function buildFolderChildren(folder: FolderScan): MdxFolderTreeNode[] {
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

    const folderPath = item.folder.displayPath || item.folder.relativePath
    const folderNode: Extract<MdxFolderTreeNode, { type: 'folder' }> = {
      type: 'folder',
      name: item.folder.meta.title ?? item.folder.name,
      path: folderPath,
      absolutePath: item.folder.absolutePath,
      children
    }

    assignFolderMetadata(folderNode, item.folder.meta)
    if (item.folder.meta.defaultOpen !== undefined)
      folderNode.defaultOpen = item.folder.meta.defaultOpen
    if (item.folder.meta.collapsible !== undefined)
      folderNode.collapsible = item.folder.meta.collapsible

    return [folderNode]
  })
}

export function assignFolderMetadata(
  folder: MdxFolder | Extract<MdxFolderTreeNode, { type: 'folder' }>,
  meta: MetaFile
): void {
  if (meta.description !== undefined) folder.description = meta.description
  if (meta.icon !== undefined) folder.icon = meta.icon
  if (meta.root !== undefined) folder.root = meta.root
}

export function flattenFiles(folder: FolderScan): MdxFolderEntry[] {
  return orderItems(folder)
    .filter((item) => item.type !== 'separator' && item.type !== 'link')
    .flatMap((item) => {
      if (item.type === 'file') return [createMdxFolderEntry(item.file)]
      return flattenFiles(item.folder)
    })
}

function createMdxFolderEntry(file: FolderScan['files'][number]): MdxFolderEntry {
  const entry: MdxFolderEntry = {
    path: file.path,
    name: file.name,
    relativePath: file.relativePath,
    displayPath: file.displayPath,
    slug: file.slug,
    links: [],
    backlinks: []
  }

  if (file.title !== undefined) entry.title = file.title
  if (file.description !== undefined) entry.description = file.description
  if (file.icon !== undefined) entry.icon = file.icon

  return entry
}
