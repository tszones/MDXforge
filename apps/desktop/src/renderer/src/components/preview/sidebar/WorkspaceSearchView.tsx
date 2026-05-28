import { Search } from 'lucide-react'
import { useRef, useState } from 'react'
import type { MdxWorkspace } from '../../../types'
import { SidebarFilterInput } from './SidebarControls'
import { SidebarShell } from './SidebarShell'
import { useWorkspaceSidebarContextMenu } from './useWorkspaceSidebarContextMenu'
import { useWorkspaceSearch } from './useWorkspaceSidebarTabs'
import { WorkspaceSearchPanel } from './WorkspaceSearchPanel'

export function WorkspaceSearchView({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onDeletePath,
  opening
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string, options?: { newTab?: boolean }) => void
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
}): React.JSX.Element {
  const file = workspace.file
  const workspaceRoot = workspace.folder?.rootPath
  const [searchQuery, setSearchQuery] = useState('')
  const fileFilterInputRef = useRef<HTMLInputElement>(null)
  const workspaceSearchInputRef = useRef<HTMLInputElement>(null)
  const { contextMenu, openContextMenu, copyPath, showInFolder, openInVsCode } =
    useWorkspaceSidebarContextMenu({ onDeletePath, workspaceRoot })
  const {
    searching,
    workspaceSearchResults,
    workspaceSearchLoading,
    collapsedSearchFiles,
    toggleSearchResultFile
  } = useWorkspaceSearch({ activeTab: 'search', searchQuery, workspaceRoot })

  return (
    <SidebarShell
      title={
        <>
          <div className="flex items-center gap-2 font-medium">
            <span>Search</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
            <Search className="size-4 shrink-0" />
            <SidebarFilterInput
              activeTab="search"
              fileFilterInputRef={fileFilterInputRef}
              workspaceSearchInputRef={workspaceSearchInputRef}
              fileFilterQuery=""
              searchQuery={searchQuery}
              onFileFilterQueryChange={() => undefined}
              onSearchQueryChange={setSearchQuery}
            />
          </div>
        </>
      }
      onOpenFile={onOpenFile}
      onOpenFolder={onOpenFolder}
      opening={opening}
    >
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
    </SidebarShell>
  )
}
