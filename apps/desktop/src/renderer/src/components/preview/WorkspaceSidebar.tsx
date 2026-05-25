import { useHotkeys } from '@tanstack/react-hotkeys'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth
} from 'fumadocs-ui/components/sidebar/base'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  PanelLeft,
  PanelLeftClose,
  Search,
  X
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { appHotkeys } from '../../lib/hotkeys'
import { m } from '../../paraglide/messages'
import type {
  MdxFolderEntry,
  MdxFolderTreeNode,
  MdxWorkspace,
  MdxWorkspaceSearchResult
} from '../../types'

type FileTreeNode =
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

type SidebarTab = 'files' | 'search'

export function PreviewSidebar({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  opening,
  collapsed,
  onCollapseSidebar,
  onExpandSidebar
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
  collapsed?: boolean
  onCollapseSidebar?: () => void
  onExpandSidebar?: () => void
}): React.JSX.Element {
  const file = workspace.file
  const [activeTab, setActiveTab] = useState<SidebarTab>('files')
  const [fileFilterQuery, setFileFilterQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [workspaceSearchResults, setWorkspaceSearchResults] = useState<MdxWorkspaceSearchResult[]>(
    []
  )
  const [workspaceSearchLoading, setWorkspaceSearchLoading] = useState(false)
  const [collapsedSearchFiles, setCollapsedSearchFiles] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const fileFilterInputRef = useRef<HTMLInputElement>(null)
  const workspaceSearchInputRef = useRef<HTMLInputElement>(null)
  const tree = useMemo(
    () => buildFileTree(workspace.folder?.files ?? [], workspace.folder?.tree, workspace.folder?.rootPath),
    [workspace.folder]
  )
  const filteredTree = useMemo(() => filterFileTree(tree, fileFilterQuery), [tree, fileFilterQuery])
  const searching = searchQuery.trim().length > 0

  useHotkeys(
    [
      {
        hotkey: appHotkeys.searchWorkspace,
        callback: () => {
          onExpandSidebar?.()
          window.setTimeout(() => {
            setActiveTab('search')
            workspaceSearchInputRef.current?.focus()
            workspaceSearchInputRef.current?.select()
          }, 0)
        },
        options: {
          enabled: Boolean(workspace.folder),
          meta: {
            name: 'Search workspace',
            description: 'Open the workspace search tab in the sidebar.'
          }
        }
      }
    ],
    { ignoreInputs: true }
  )

  useEffect(() => {
    setCollapsedSearchFiles(new Set())
  }, [searchQuery])

  useEffect(() => {
    let canceled = false
    const workspaceRoot = workspace.folder?.rootPath
    const trimmedQuery = searchQuery.trim()

    if (!workspaceRoot || activeTab !== 'search' || !trimmedQuery) {
      setWorkspaceSearchResults([])
      setWorkspaceSearchLoading(false)
      return
    }

    setWorkspaceSearchLoading(true)
    const timer = window.setTimeout(() => {
      void window.api
        .searchMdxWorkspace(workspaceRoot, trimmedQuery)
        .then((results) => {
          if (canceled) return
          setWorkspaceSearchResults(results)
          setWorkspaceSearchLoading(false)
        })
        .catch(() => {
          if (canceled) return
          setWorkspaceSearchResults([])
          setWorkspaceSearchLoading(false)
        })
    }, 150)

    return () => {
      canceled = true
      window.clearTimeout(timer)
    }
  }, [activeTab, searchQuery, workspace.folder?.rootPath])

  useEffect(() => {
    if (!contextMenu) return
    const close = (): void => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', close)
    }
  }, [contextMenu])

  function openContextMenu(event: React.MouseEvent, path: string): void {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY, path })
  }

  async function copyPath(path: string): Promise<void> {
    setContextMenu(null)
    try {
      await window.api.copyPath(path)
      toast.success(m.preview_file_path_copied())
    } catch {
      toast.error(m.preview_file_path_copy_failed())
    }
  }

  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full w-[268px] flex-col">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">
          <div className="flex items-center">
            <div className="me-auto flex min-w-0 items-center">
              <div className="inline-flex items-center gap-2.5 font-medium text-[0.9375rem] leading-none">
                <BookOpen className="size-4 shrink-0 text-fd-primary" />
                <span>MDXForge</span>
              </div>
            </div>
            {onCollapseSidebar ? (
              <button
                type="button"
                aria-label={collapsed ? m.preview_expand_sidebar() : m.preview_collapse_sidebar()}
                onClick={collapsed ? onExpandSidebar : onCollapseSidebar}
                className="flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                {collapsed ? (
                  <PanelLeft className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
            ) : null}
          </div>
          {workspace.folder ? (
            <>
              <div className="grid grid-cols-2 rounded-lg border bg-fd-secondary/50 p-1 text-xs font-medium text-fd-muted-foreground">
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={
                    activeTab === 'files'
                      ? 'rounded-md bg-fd-background px-2 py-1.5 text-fd-foreground shadow-sm'
                      : 'rounded-md px-2 py-1.5 transition-colors hover:text-fd-foreground'
                  }
                >
                  {m.preview_tab_files()}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className={
                    activeTab === 'search'
                      ? 'rounded-md bg-fd-background px-2 py-1.5 text-fd-foreground shadow-sm'
                      : 'rounded-md px-2 py-1.5 transition-colors hover:text-fd-foreground'
                  }
                >
                  {m.preview_tab_search()}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
                <Search className="size-4 shrink-0" />
                {activeTab === 'files' ? (
                  <input
                    ref={fileFilterInputRef}
                    value={fileFilterQuery}
                    onChange={(event) => setFileFilterQuery(event.target.value)}
                    placeholder={m.preview_filter_files_placeholder()}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
                  />
                ) : (
                  <input
                    ref={workspaceSearchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={m.preview_search_workspace_placeholder()}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
                  />
                )}
                {(activeTab === 'files' ? fileFilterQuery : searchQuery) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'files') setFileFilterQuery('')
                      else setSearchQuery('')
                    }}
                    className="rounded p-0.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
                    aria-label={m.preview_clear_search()}
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground">
              <FileText className="size-4" />
              <span>{m.preview_single_file_preview()}</span>
            </div>
          )}
        </div>

        <div className="fd-scroll-container min-h-0 flex-1 overflow-auto px-3 py-2 [mask:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]">
          {workspace.folder && activeTab === 'search' ? (
            <>
              <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
                {searching
                  ? workspaceSearchLoading
                    ? m.search_loading()
                    : m.preview_search_results({
                        count: workspaceSearchResults.reduce(
                          (count, result) => count + result.matches.length,
                          0
                        )
                      })
                  : m.preview_search_tab()}
              </p>
              {searching ? (
                workspaceSearchLoading ? (
                  <SidebarEmptyState>{m.search_loading()}</SidebarEmptyState>
                ) : workspaceSearchResults.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {workspaceSearchResults.map((result) => (
                      <WorkspaceSearchResultGroup
                        key={result.path}
                        result={result}
                        active={result.path === file.path}
                        collapsed={collapsedSearchFiles.has(result.path)}
                        onToggle={() => {
                          setCollapsedSearchFiles((current) => {
                            const next = new Set(current)
                            if (next.has(result.path)) next.delete(result.path)
                            else next.add(result.path)
                            return next
                          })
                        }}
                        onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
                      />
                    ))}
                  </div>
                ) : (
                  <SidebarEmptyState>{m.search_empty_no_results()}</SidebarEmptyState>
                )
              ) : (
                <SidebarEmptyState>{m.preview_search_empty()}</SidebarEmptyState>
              )}
            </>
          ) : (
            <>
              <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
                {workspace.folder && fileFilterQuery.trim().length > 0
                  ? m.preview_filtered_files()
                  : workspace.folder
                    ? m.preview_files_nav()
                    : m.preview_current_file()}
              </p>
              {(workspace.folder ? filteredTree : tree).length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {(workspace.folder ? filteredTree : tree).map((node, index) => (
                    <FileTreeNodeView
                      key={getTreeNodeKey(node, index)}
                      node={node}
                      activePath={file.path}
                      onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
                      onRenamePath={(targetPath, nextName) =>
                        onRenamePath(targetPath, nextName, workspace.folder?.rootPath)
                      }
                      renamingPath={renamingPath}
                      onStartRename={setRenamingPath}
                      onStopRename={() => setRenamingPath(null)}
                      onOpenContextMenu={openContextMenu}
                    />
                  ))}
                  <FileTreeNodeContextMenu
                    menu={contextMenu}
                    onCopyPath={(path) => void copyPath(path)}
                    onRename={(path) => {
                      setContextMenu(null)
                      setRenamingPath(path)
                    }}
                  />
                </div>
              ) : workspace.folder ? (
                <SidebarEmptyState>
                  {fileFilterQuery.trim().length > 0 ? m.preview_no_file_matches() : m.preview_empty_files()}
                </SidebarEmptyState>
              ) : (
                <div className="relative flex flex-row items-center gap-2 rounded-lg bg-fd-primary/10 p-2 text-start text-fd-primary wrap-anywhere">
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenFile}
              disabled={opening}
              title={opening ? m.actions_opening() : m.actions_open_mdx_file()}
              className="inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-fd-secondary/50 px-2 text-center text-xs leading-none text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FileText className="size-3.5 shrink-0 text-fd-muted-foreground" />
              <span className="truncate">{opening ? m.actions_opening() : m.actions_open_mdx_file()}</span>
            </button>
            <button
              type="button"
              onClick={onOpenFolder}
              disabled={opening}
              title={m.actions_open_folder()}
              className="inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-fd-secondary/50 px-2 text-center text-xs leading-none text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FolderOpen className="size-3.5 shrink-0 text-fd-muted-foreground" />
              <span className="truncate">{m.actions_open_folder()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FileTreeNodeView({
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
  onOpenPath: (filePath: string) => void
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
  onOpenPath: (filePath: string) => void
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
        onContextMenu={(event) => openContextMenuForPath(event, node.absolutePath, onOpenContextMenu)}
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
  onOpenPath: (filePath: string) => void
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
        onOpenPath(entry.path)
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


function FileTreeNodeContextMenu({
  menu,
  onCopyPath,
  onRename
}: {
  menu: { x: number; y: number; path: string } | null
  onCopyPath: (path: string) => void
  onRename: (path: string) => void
}): React.JSX.Element | null {
  if (!menu) return null

  return createPortal(
    <div
      className="fixed z-[9999] min-w-44 overflow-hidden rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg"
      style={{ left: menu.x, top: menu.y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
        onClick={() => onCopyPath(menu.path)}
      >
        <Copy className="size-4 text-fd-primary" />
        {m.preview_copy_file_path()}
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
        onClick={() => onRename(menu.path)}
      >
        <span className="size-4" />
        {m.preview_rename_item()}
      </button>
    </div>,
    document.body
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

function RenameInput({
  value,
  onRename,
  onCancel
}: {
  value: string
  onRename: (nextName: string) => Promise<void>
  onCancel: () => void
}): React.JSX.Element {
  const [nextName, setNextName] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setNextName(value), [value])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.focus()

    const extensionStart = getExtensionStart(value)
    input.setSelectionRange(0, extensionStart)
  }, [value])

  async function submit(): Promise<void> {
    const trimmed = nextName.trim()
    if (!trimmed || trimmed === value) {
      onCancel()
      return
    }

    await onRename(trimmed)
    onCancel()
  }

  return (
    <input
      ref={inputRef}
      value={nextName}
      aria-label={m.preview_rename_item()}
      placeholder={m.preview_rename_placeholder()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onChange={(event) => setNextName(event.target.value)}
      onBlur={() => void submit()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Enter') void submit()
        if (event.key === 'Escape') onCancel()
      }}
      className="min-w-0 flex-1 rounded border bg-fd-background px-1.5 py-0.5 text-sm text-fd-foreground outline-none ring-fd-primary focus:ring-1"
    />
  )
}

function getExtensionStart(fileName: string): number {
  const extensionStart = fileName.lastIndexOf('.')
  if (extensionStart <= 0) return fileName.length
  return extensionStart
}

function buildFileTree(
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

function WorkspaceSearchResultGroup({
  result,
  active,
  collapsed,
  onToggle,
  onOpenPath
}: {
  result: MdxWorkspaceSearchResult
  active: boolean
  collapsed: boolean
  onToggle: () => void
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  return (
    <div className="rounded-lg text-fd-muted-foreground data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary" data-active={active}>
      <button
        type="button"
        title={result.relativePath}
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg p-2 text-start transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
      >
        {collapsed ? (
          <ChevronRight className="size-3.5 shrink-0" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0" />
        )}
        <FileText className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {result.title ?? result.displayPath ?? result.name}
        </span>
        <span className="shrink-0 rounded-full bg-fd-secondary px-1.5 py-0.5 text-[0.6875rem] leading-none text-fd-muted-foreground">
          {result.matches.length}
        </span>
      </button>
      {collapsed ? null : (
        <div className="ms-7 flex flex-col gap-0.5 border-s border-fd-border ps-2 pb-1">
          {result.matches.map((match) => (
            <WorkspaceSearchMatchItem
              key={`${result.path}:${match.line}:${match.column}:${match.preview}`}
              result={result}
              match={match}
              onOpenPath={onOpenPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WorkspaceSearchMatchItem({
  result,
  match,
  onOpenPath
}: {
  result: MdxWorkspaceSearchResult
  match: MdxWorkspaceSearchResult['matches'][number]
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={`${result.relativePath}:${match.line}:${match.column}`}
      onClick={() => onOpenPath(result.path)}
      className="flex w-full flex-col rounded-md px-2 py-1.5 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
    >
      <span className="truncate text-xs opacity-80">
        {m.search_line_column({ line: match.line, column: match.column })}
      </span>
      <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-fd-foreground/80">
        {match.preview}
      </span>
    </button>
  )
}

function SidebarEmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="rounded-lg px-2 py-4 text-xs text-fd-muted-foreground">{children}</div>
}

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return getTreeNodeSortName(a).localeCompare(getTreeNodeSortName(b))
  })
}

function nodeContainsPath(node: FileTreeNode, activePath: string): boolean {
  if (node.type === 'file') return node.entry.path === activePath
  if (node.type !== 'folder') return false
  return node.children.some((child) => nodeContainsPath(child, activePath))
}

function getTreeNodeKey(node: FileTreeNode, index: number): string {
  if (node.type === 'file') return `file:${node.entry.path}`
  if (node.type === 'folder') return `folder:${node.path}`
  if (node.type === 'link') return `link:${node.href}:${index}`
  return `separator:${node.label}:${index}`
}

function getTreeNodeSortName(node: FileTreeNode): string {
  if (node.type === 'file') return getDisplayName(node.entry)
  if (node.type === 'folder') return node.name
  if (node.type === 'link') return node.label
  return node.label
}

function getItemOffset(depth: number): string {
  return `calc(${2 + 3 * depth} * var(--spacing))`
}

function getDisplayName(entry: MdxFolderEntry): string {
  const path = entry.displayPath ?? entry.relativePath
  const name = path.split('/').filter(Boolean).at(-1)
  if (name) return name

  return entry.name
}

function filterFileTree(nodes: FileTreeNode[], query: string): FileTreeNode[] {
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
