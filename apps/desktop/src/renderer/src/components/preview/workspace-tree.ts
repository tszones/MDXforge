import type { MdxFolderEntry, MdxFolderTreeNode } from '../../types'

export type FileTreeNode =
  | { type: 'file'; entry: MdxFolderEntry }
  | {
      type: 'folder'
      name: string
      path: string
      absolutePath: string
      description?: string
      icon?: string
      root?: boolean
      defaultOpen?: boolean
      collapsible?: boolean
      children: FileTreeNode[]
    }
  | { type: 'separator'; label: string; icon?: string }
  | { type: 'link'; label: string; href: string; external?: boolean; icon?: string }

export function buildFileTree(
  entries: MdxFolderEntry[],
  pageTree?: MdxFolderTreeNode[],
  workspaceRoot?: string
): FileTreeNode[] {
  if (pageTree && pageTree.length > 0) return buildFileTreeFromPageTree(entries, pageTree)

  const root: Array<FileTreeNode> = []

  for (const entry of [...entries].sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    const parts = entry.relativePath.split('/')
    let current = root
    let currentPath = ''

    for (const [index, part] of parts.entries()) {
      const isFile = index === parts.length - 1
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (isFile) {
        current.push({ type: 'file', entry })
        continue
      }

      let folder = current.find(
        (node): node is Extract<FileTreeNode, { type: 'folder' }> =>
          node.type === 'folder' && node.name === part
      )

      if (!folder) {
        folder = {
          type: 'folder',
          name: part,
          path: currentPath,
          absolutePath: workspaceRoot ? joinWorkspacePath(workspaceRoot, currentPath) : '',
          children: []
        }
        current.push(folder)
      }

      current = folder.children
    }
  }

  return sortTree(root)
}

export function filterFileTree(nodes: FileTreeNode[], query: string): FileTreeNode[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return nodes

  return nodes
    .map((node): FileTreeNode | null => {
      if (node.type === 'file') return fileNodeMatches(node, normalizedQuery) ? node : null
      if (node.type === 'folder') {
        const children = filterFileTree(node.children, normalizedQuery)
        if (children.length > 0 || folderNodeMatches(node, normalizedQuery)) {
          return { ...node, defaultOpen: true, children }
        }
        return null
      }
      if (node.type === 'link') return node.label.toLowerCase().includes(normalizedQuery) ? node : null
      if (node.type === 'separator') return null
      return null
    })
    .filter((node): node is FileTreeNode => node !== null)
}

export function nodeContainsPath(node: FileTreeNode, activePath: string): boolean {
  if (node.type === 'file') return node.entry.path === activePath
  if (node.type !== 'folder') return false
  return node.children.some((child) => nodeContainsPath(child, activePath))
}

export function getTreeNodeKey(node: FileTreeNode, index: number): string {
  if (node.type === 'file') return `file:${node.entry.path}`
  if (node.type === 'folder') return `folder:${node.path}`
  if (node.type === 'link') return `link:${node.href}:${index}`
  return `separator:${node.label}:${index}`
}

export function getItemOffset(depth: number): string {
  return `calc(${2 + 3 * depth} * var(--spacing))`
}

export function getDisplayName(entry: MdxFolderEntry): string {
  const path = entry.displayPath ?? entry.relativePath
  const name = path.split('/').filter(Boolean).at(-1)
  if (name) return name

  return entry.name
}

function buildFileTreeFromPageTree(
  entries: MdxFolderEntry[],
  pageTree: MdxFolderTreeNode[]
): FileTreeNode[] {
  const filesByPath = new Map(entries.map((entry) => [entry.path, entry]))

  return pageTree
    .map((node): FileTreeNode | null => {
      if (node.type === 'separator') return node
      if (node.type === 'link') return node

      if (node.type === 'file') {
        const entry = filesByPath.get(node.path)
        return entry ? { type: 'file', entry } : null
      }

      return {
        type: 'folder',
        name: node.name,
        path: node.path,
        absolutePath: node.absolutePath,
        description: node.description,
        icon: node.icon,
        root: node.root,
        defaultOpen: node.defaultOpen,
        collapsible: node.collapsible,
        children: buildFileTreeFromPageTree(entries, node.children)
      }
    })
    .filter((node): node is FileTreeNode => node !== null)
}

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return getTreeNodeSortName(a).localeCompare(getTreeNodeSortName(b))
  })
}

function getTreeNodeSortName(node: FileTreeNode): string {
  if (node.type === 'file') return getDisplayName(node.entry)
  if (node.type === 'folder') return node.name
  if (node.type === 'link') return node.label
  return node.label
}

function fileNodeMatches(node: Extract<FileTreeNode, { type: 'file' }>, query: string): boolean {
  const entry = node.entry
  return [entry.name, entry.title, entry.relativePath, entry.displayPath]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query))
}

function folderNodeMatches(node: Extract<FileTreeNode, { type: 'folder' }>, query: string): boolean {
  return [node.name, node.path, node.description]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query))
}

function joinWorkspacePath(root: string, relativePath: string): string {
  const separator = root.includes('\\') ? '\\' : '/'
  return [root.replace(/[\\/]+$/, ''), ...relativePath.split('/')].join(separator)
}
