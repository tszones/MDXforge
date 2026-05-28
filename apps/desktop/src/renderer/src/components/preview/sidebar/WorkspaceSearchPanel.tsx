import { FolderOpen } from 'lucide-react'
import { m } from '../../../paraglide/messages'
import type { MdxWorkspaceSearchResult } from '../../../types'
import { FileTreeNodeContextMenu } from '../FileTreeNodeContextMenu'
import { WorkspaceSearchResultGroup } from '../WorkspaceSearchResultGroup'
import type { SidebarContextMenuState } from './useWorkspaceSidebarContextMenu'

export function WorkspaceSearchPanel({
  activePath,
  workspaceRoot,
  searching,
  loading,
  results,
  collapsedSearchFiles,
  contextMenu,
  onToggleResult,
  onOpenPath,
  onOpenContextMenu,
  onShowInFolder,
  onOpenInVsCode,
  onCopyPath
}: {
  activePath: string
  workspaceRoot?: string
  searching: boolean
  loading: boolean
  results: MdxWorkspaceSearchResult[]
  collapsedSearchFiles: Set<string>
  contextMenu: SidebarContextMenuState
  onToggleResult: (path: string) => void
  onOpenPath: (filePath: string, workspaceRoot?: string, options?: { newTab?: boolean }) => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
  onShowInFolder: (path: string) => void
  onOpenInVsCode: (path: string) => void
  onCopyPath: (path: string) => void
}): React.JSX.Element {
  return (
    <>
      <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
        {searching
          ? loading
            ? m.search_loading()
            : m.preview_search_results({
                count: results.reduce((count, result) => count + result.matches.length, 0)
              })
          : m.preview_search_tab()}
      </p>
      {searching ? (
        loading ? (
          <SidebarEmptyState>{m.search_loading()}</SidebarEmptyState>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {results.map((result) => (
              <WorkspaceSearchResultGroup
                key={result.path}
                result={result}
                active={result.path === activePath}
                collapsed={collapsedSearchFiles.has(result.path)}
                onToggle={() => onToggleResult(result.path)}
                onOpenPath={(filePath, options) => onOpenPath(filePath, workspaceRoot, options)}
                onOpenContextMenu={onOpenContextMenu}
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
        onShowInFolder={(path) => onShowInFolder(path)}
        onOpenInVsCode={(path) => onOpenInVsCode(path)}
        onCopyPath={(path) => onCopyPath(path)}
      />
    </>
  )
}

export function SidebarEmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="rounded-lg px-2 py-4 text-xs text-fd-muted-foreground">{children}</div>
}

export function SingleFileRow({ name }: { name: string }): React.JSX.Element {
  return (
    <div className="relative flex flex-row items-center gap-2 rounded-lg bg-fd-primary/10 p-2 text-start text-fd-primary wrap-anywhere">
      <FolderOpen className="size-4 shrink-0" />
      <span className="truncate">{name}</span>
    </div>
  )
}
