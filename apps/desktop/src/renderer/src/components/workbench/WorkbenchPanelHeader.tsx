import { BookOpen, Bot, PanelLeftClose, PanelRightClose, Search } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { SidebarTab } from '../preview/sidebar/useWorkspaceSidebarTabs'
import type { RightSidebarTab } from './RightSidebar'
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
      <WorkbenchIconButton label={m.preview_collapse_sidebar()} onClick={onCollapse}>
        <PanelLeftClose className="size-4" />
      </WorkbenchIconButton>
      <WorkbenchHeaderSeparator />
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
    </WorkbenchPanelHeader>
  )
}

export function WorkbenchRightPanelHeader({
  activeTab,
  onOpenAi,
  onCollapse
}: {
  activeTab: RightSidebarTab
  onOpenAi: () => void
  onCollapse: () => void
}): React.JSX.Element {
  return (
    <WorkbenchPanelHeader>
      <WorkbenchIconButton label={m.preview_collapse_sidebar()} onClick={onCollapse}>
        <PanelRightClose className="size-4" />
      </WorkbenchIconButton>
      <WorkbenchHeaderSeparator />
      <WorkbenchTabIconButton active={activeTab === 'ai'} label={m.workbench_ai()} onClick={onOpenAi}>
        <Bot className="size-4" />
      </WorkbenchTabIconButton>
    </WorkbenchPanelHeader>
  )
}

function WorkbenchPanelHeader({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="flex h-8 items-center gap-1 border-b px-2">{children}</div>
}

function WorkbenchHeaderSeparator(): React.JSX.Element {
  return <div className="mx-1 h-5 w-px bg-fd-border" />
}
