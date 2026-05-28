import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth
} from 'fumadocs-ui/components/sidebar/base'
import { ExternalLink, FileText, FolderOpen } from 'lucide-react'
import type { MdxFolderEntry } from '../../types'
import { RenameInput } from './RenameInput'
import {
  type FileTreeNode,
  getDisplayName,
  getItemOffset,
  getTreeNodeKey,
  nodeContainsPath
} from './workspace-tree'

export function FileTreeNodeView({
  node,
  activePath,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename,
  onOpenContextMenu
}: {
  node: FileTreeNode
  activePath: string
  onOpenPath: (filePath: string, options?: { newTab?: boolean }) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
}): React.JSX.Element {
  if (node.type === 'separator') {
    return (
      <div className="px-2 pb-1 pt-3 text-xs font-medium text-fd-muted-foreground">
        {node.label}
      </div>
    )
  }

  if (node.type === 'link') {
    return (
      <a
        href={node.href}
        target={node.external ? '_blank' : undefined}
        rel={node.external ? 'noreferrer' : undefined}
        className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <ExternalLink className="size-4 shrink-0" />
        <span className="truncate">{node.label}</span>
      </a>
    )
  }

  if (node.type === 'file') {
    return (
      <FileTreeItem
        entry={node.entry}
        active={node.entry.path === activePath}
        onOpenPath={onOpenPath}
        onRenamePath={onRenamePath}
        renamingPath={renamingPath}
        onStartRename={onStartRename}
        onStopRename={onStopRename}
        onOpenContextMenu={onOpenContextMenu}
      />
    )
  }

  return (
    <FileTreeFolder
      node={node}
      activePath={activePath}
      onOpenPath={onOpenPath}
      onRenamePath={onRenamePath}
      renamingPath={renamingPath}
      onStartRename={onStartRename}
      onStopRename={onStopRename}
      onOpenContextMenu={onOpenContextMenu}
    />
  )
}

function FileTreeFolder({
  node,
  activePath,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename,
  onOpenContextMenu
}: {
  node: Extract<FileTreeNode, { type: 'folder' }>
  activePath: string
  onOpenPath: (filePath: string, options?: { newTab?: boolean }) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
}): React.JSX.Element {
  const active = nodeContainsPath(node, activePath)
  const depth = useFolderDepth()

  return (
    <SidebarFolder
      active={active}
      defaultOpen={node.defaultOpen ?? active}
      collapsible={node.collapsible}
    >
      <SidebarFolderTrigger
        className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:text-fd-foreground [&_svg]:size-4 [&_svg]:shrink-0"
        data-active={active}
        title={node.description ?? node.path}
        onDoubleClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onStartRename(node.absolutePath)
        }}
        onKeyDown={(event) => {
          if (event.key !== 'F2') return
          event.preventDefault()
          event.stopPropagation()
          onStartRename(node.absolutePath)
        }}
        onContextMenu={(event) =>
          openContextMenuForPath(event, node.absolutePath, onOpenContextMenu)
        }
        style={{ paddingInlineStart: getItemOffset(depth) }}
      >
        <FolderOpen className="size-4 shrink-0" />
        {renamingPath === node.absolutePath ? (
          <RenameInput
            value={node.name}
            onRename={(nextName) => onRenamePath(node.absolutePath, nextName)}
            onCancel={onStopRename}
          />
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </SidebarFolderTrigger>
      <SidebarFolderContent className="relative flex flex-col gap-0.5 pt-0.5 before:absolute before:inset-y-1 before:inset-s-2.5 before:w-px before:bg-fd-border before:content-['']">
        {node.children.map((child, index) => (
          <FileTreeNodeView
            key={getTreeNodeKey(child, index)}
            node={child}
            activePath={activePath}
            onOpenPath={onOpenPath}
            onRenamePath={onRenamePath}
            renamingPath={renamingPath}
            onStartRename={onStartRename}
            onStopRename={onStopRename}
            onOpenContextMenu={onOpenContextMenu}
          />
        ))}
      </SidebarFolderContent>
    </SidebarFolder>
  )
}

function FileTreeItem({
  entry,
  active,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename,
  onOpenContextMenu
}: {
  entry: MdxFolderEntry
  active: boolean
  onOpenPath: (filePath: string, options?: { newTab?: boolean }) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
}): React.JSX.Element {
  const depth = useFolderDepth()

  return (
    <SidebarItem
      href="#"
      active={active}
      icon={<FileText className="size-4 shrink-0" />}
      title={entry.relativePath}
      onClick={(event) => {
        event.preventDefault()
        if (renamingPath === entry.path) return
        onOpenPath(entry.path, { newTab: event.ctrlKey || event.metaKey })
      }}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onStartRename(entry.path)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'F2') return
        event.preventDefault()
        event.stopPropagation()
        onStartRename(entry.path)
      }}
      onContextMenu={(event) => openContextMenuForPath(event, entry.path, onOpenContextMenu)}
      className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-fd-primary data-[active=true]:before:content-[''] [&_svg]:size-4 [&_svg]:shrink-0"
      style={{ paddingInlineStart: getItemOffset(depth) }}
    >
      {renamingPath === entry.path ? (
        <RenameInput
          value={entry.name}
          onRename={(nextName) => onRenamePath(entry.path, nextName)}
          onCancel={onStopRename}
        />
      ) : (
        <span className="truncate">{entry.title ?? getDisplayName(entry)}</span>
      )}
    </SidebarItem>
  )
}

function openContextMenuForPath(
  event: React.MouseEvent,
  path: string,
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
): void {
  if (!path) return
  onOpenContextMenu(event, path)
}
