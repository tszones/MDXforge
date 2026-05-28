import { BookOpen, Search, X } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { SidebarTab } from '../preview/sidebar/useWorkspaceSidebarTabs'
import { WorkbenchIconButton, WorkbenchTabIconButton } from './WorkbenchIconButton'

export function WorkbenchLeftPanelHeader({
  activeTab,
  onTabChange,
  onCollapse
}: {
  activeTab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  onCollapse: () => void
}): React.JSX.Element {
  return (
    <WorkbenchPanelHeader>
      <WorkbenchTabIconButton
        active={activeTab === 'files'}
        label={m.workbench_discover()}
        onClick={() => onTabChange('files')}
      >
        <BookOpen className="size-4" />
      </WorkbenchTabIconButton>
      <WorkbenchTabIconButton
        active={activeTab === 'search'}
        label={m.workbench_search()}
        onClick={() => onTabChange('search')}
      >
        <Search className="size-4" />
      </WorkbenchTabIconButton>
      <div className="flex-1" />
      <WorkbenchIconButton label={m.preview_collapse_sidebar()} onClick={onCollapse}>
        <X className="size-4" />
      </WorkbenchIconButton>
    </WorkbenchPanelHeader>
  )
}

export function WorkbenchRightPanelHeader({
  onCollapse
}: {
  onCollapse: () => void
}): React.JSX.Element {
  return (
    <div className="flex h-10 items-center justify-end px-3 pt-2">
      <WorkbenchIconButton label={m.preview_collapse_sidebar()} onClick={onCollapse}>
        <X className="size-4" />
      </WorkbenchIconButton>
    </div>
  )
}

function WorkbenchPanelHeader({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="flex h-10 items-center gap-1 px-3 pt-2">{children}</div>
}
