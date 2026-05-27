import { BookOpen, FileText, FolderOpen, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { m } from '../../paraglide/messages'
import type { MdxWorkspace } from '../../types'
import { SidebarFilterInput, SidebarTabs } from './sidebar/SidebarControls'
import { useWorkspaceSidebarContextMenu } from './sidebar/useWorkspaceSidebarContextMenu'
import type { SidebarTab } from './sidebar/useWorkspaceSidebarTabs'
import { useWorkspaceSearch, useWorkspaceSidebarTabs } from './sidebar/useWorkspaceSidebarTabs'
import { WorkspaceFilesPanel } from './sidebar/WorkspaceFilesPanel'
import { WorkspaceSearchPanel } from './sidebar/WorkspaceSearchPanel'
import { buildFileTree, buildSingleFileTree, filterFileTree } from './workspace-tree'

export function PreviewSidebar({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  onDeletePath,
  opening,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onExpandSidebar
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
  activeTab?: SidebarTab
  onActiveTabChange?: (tab: SidebarTab) => void
  onExpandSidebar?: () => void
}): React.JSX.Element {
  const file = workspace.file
  const workspaceRoot = workspace.folder?.rootPath
  const hasWorkspaceFolder = Boolean(workspace.folder)
  const [fileFilterQuery, setFileFilterQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const fileFilterInputRef = useRef<HTMLInputElement>(null)
  const workspaceSearchInputRef = useRef<HTMLInputElement>(null)
  const { activeTab, setActiveTab } = useWorkspaceSidebarTabs({
    hasWorkspaceFolder,
    activeTab: controlledActiveTab,
    onActiveTabChange,
    onExpandSidebar,
    workspaceSearchInputRef
  })
  const {
    searching,
    workspaceSearchResults,
    workspaceSearchLoading,
    collapsedSearchFiles,
    toggleSearchResultFile
  } = useWorkspaceSearch({ activeTab, searchQuery, workspaceRoot })
  const {
    contextMenu,
    setContextMenu,
    openContextMenu,
    copyPath,
    showInFolder,
    openInVsCode,
    deletePath
  } = useWorkspaceSidebarContextMenu({ onDeletePath, workspaceRoot })
  const tree = useMemo(
    () =>
      workspace.folder
        ? buildFileTree(workspace.folder.files, workspace.folder.tree, workspace.folder.rootPath)
        : buildSingleFileTree(file),
    [file, workspace.folder]
  )
  const filteredTree = useMemo(() => filterFileTree(tree, fileFilterQuery), [tree, fileFilterQuery])
  const activeTree = filteredTree

  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">
          <div className="flex items-center">
            <div className="me-auto flex min-w-0 items-center">
              <div className="inline-flex items-center gap-2.5 font-medium text-[0.9375rem] leading-none">
                <BookOpen className="size-4 shrink-0 text-fd-primary" />
                <span>MDXForge</span>
              </div>
            </div>
          </div>
          {workspace.folder ? (
            <>
              <SidebarTabs activeTab={activeTab} onActiveTabChange={setActiveTab} />
              <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
                <Search className="size-4 shrink-0" />
                <SidebarFilterInput
                  activeTab={activeTab}
                  fileFilterInputRef={fileFilterInputRef}
                  workspaceSearchInputRef={workspaceSearchInputRef}
                  fileFilterQuery={fileFilterQuery}
                  searchQuery={searchQuery}
                  onFileFilterQueryChange={setFileFilterQuery}
                  onSearchQueryChange={setSearchQuery}
                />
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
            <WorkspaceSearchPanel
              activePath={file.path}
              workspaceRoot={workspaceRoot}
              searching={searching}
              loading={workspaceSearchLoading}
              results={workspaceSearchResults}
              collapsedSearchFiles={collapsedSearchFiles}
              contextMenu={contextMenu}
              onToggleResult={toggleSearchResultFile}
              onOpenPath={onOpenPath}
              onOpenContextMenu={openContextMenu}
              onShowInFolder={(path) => void showInFolder(path)}
              onOpenInVsCode={(path) => void openInVsCode(path)}
              onCopyPath={(path) => void copyPath(path)}
            />
          ) : (
            <WorkspaceFilesPanel
              activePath={file.path}
              activeName={file.name}
              workspaceRoot={workspaceRoot}
              hasWorkspaceFolder={hasWorkspaceFolder}
              fileFilterQuery={fileFilterQuery}
              nodes={activeTree}
              renamingPath={renamingPath}
              contextMenu={contextMenu}
              onOpenPath={onOpenPath}
              onRenamePath={onRenamePath}
              onStartRename={setRenamingPath}
              onStopRename={() => setRenamingPath(null)}
              onOpenContextMenu={openContextMenu}
              onShowInFolder={(path) => void showInFolder(path)}
              onOpenInVsCode={(path) => void openInVsCode(path)}
              onCopyPath={(path) => void copyPath(path)}
              onDelete={(path) => void deletePath(path)}
              onSetContextMenu={setContextMenu}
            />
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
              <span className="truncate">
                {opening ? m.actions_opening() : m.actions_open_mdx_file()}
              </span>
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
