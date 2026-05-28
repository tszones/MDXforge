import { useRef } from 'react'
import type { MdxWorkspace } from '../../types'
import type { SidebarTab } from './sidebar/useWorkspaceSidebarTabs'
import { useWorkspaceSidebarTabs } from './sidebar/useWorkspaceSidebarTabs'
import { WorkspaceFilesView } from './sidebar/WorkspaceFilesView'
import { WorkspaceSearchView } from './sidebar/WorkspaceSearchView'

export function PreviewSidebar({
  workspace,
  onOpenPath,
  onRenamePath,
  onDeletePath,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onExpandSidebar
}: {
  workspace: MdxWorkspace
  onOpenPath: (filePath: string, workspaceRoot?: string, options?: { newTab?: boolean }) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
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
      <WorkspaceSearchView workspace={workspace} onOpenPath={onOpenPath} onDeletePath={onDeletePath} />
    )
  }

  return (
    <WorkspaceFilesView
      workspace={workspace}
      onOpenPath={onOpenPath}
      onRenamePath={onRenamePath}
      onDeletePath={onDeletePath}
    />
  )
}
