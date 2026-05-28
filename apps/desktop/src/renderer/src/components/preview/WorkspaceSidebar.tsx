import { useRef } from 'react'
import type { MdxWorkspace } from '../../types'
import type { SidebarTab } from './sidebar/useWorkspaceSidebarTabs'
import { useWorkspaceSidebarTabs } from './sidebar/useWorkspaceSidebarTabs'
import { WorkspaceFilesView } from './sidebar/WorkspaceFilesView'
import { WorkspaceSearchView } from './sidebar/WorkspaceSearchView'

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
  onOpenPath: (filePath: string, workspaceRoot?: string, options?: { newTab?: boolean }) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
  activeTab?: SidebarTab
  onActiveTabChange?: (tab: SidebarTab) => void
  onExpandSidebar?: () => void
}): React.JSX.Element {
  const workspaceSearchInputRef = useRef<HTMLInputElement>(null)
  const { activeTab } = useWorkspaceSidebarTabs({
    hasWorkspaceFolder: Boolean(workspace.folder),
    activeTab: controlledActiveTab,
    onActiveTabChange,
    onExpandSidebar,
    workspaceSearchInputRef
  })

  if (workspace.folder && activeTab === 'search') {
    return (
      <WorkspaceSearchView
        workspace={workspace}
        onOpenFile={onOpenFile}
        onOpenFolder={onOpenFolder}
        onOpenPath={onOpenPath}
        onDeletePath={onDeletePath}
        opening={opening}
      />
    )
  }

  return (
    <WorkspaceFilesView
      workspace={workspace}
      onOpenFile={onOpenFile}
      onOpenFolder={onOpenFolder}
      onOpenPath={onOpenPath}
      onRenamePath={onRenamePath}
      onDeletePath={onDeletePath}
      opening={opening}
    />
  )
}
