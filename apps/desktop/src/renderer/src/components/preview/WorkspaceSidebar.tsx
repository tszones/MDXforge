import { useHotkeys } from '@tanstack/react-hotkeys'
import { toast } from 'sonner'
import { BookOpen, FileText, FolderOpen, PanelLeft, PanelLeftClose, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FileTreeNodeContextMenu } from './FileTreeNodeContextMenu'
import { FileTreeNodeView } from './FileTreeNodeView'
import { WorkspaceSearchResultGroup } from './WorkspaceSearchResultGroup'
import { buildFileTree, filterFileTree, getTreeNodeKey } from './workspace-tree'
import { appHotkeys } from '../../lib/hotkeys'
import { m } from '../../paraglide/messages'
import type { MdxWorkspace, MdxWorkspaceSearchResult } from '../../types'

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
                        onOpenContextMenu={openContextMenu}
                      />
                    ))}
                  </div>
                ) : (
                  <SidebarEmptyState>{m.search_empty_no_results()}</SidebarEmptyState>
                )
              ) : (
                <SidebarEmptyState>{m.preview_search_empty()}</SidebarEmptyState>
              )}
              <FileTreeNodeContextMenu
                menu={contextMenu}
                onCopyPath={(path) => void copyPath(path)}
              />
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

function SidebarEmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="rounded-lg px-2 py-4 text-xs text-fd-muted-foreground">{children}</div>
}
