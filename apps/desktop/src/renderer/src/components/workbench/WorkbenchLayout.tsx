import { Bot, FolderTree, ListTree, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import type { Layout, PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { WorkbenchLayoutSettings } from '../../types'
import type { SidebarTab } from '../preview/sidebar/useWorkspaceSidebarTabs'
import type { RightSidebarTab } from './RightSidebar'

export function WorkbenchLayout({
  leftSidebar,
  documentTabs,
  documentView,
  rightSidebar,
  layout,
  leftTab,
  rightTab,
  onLeftTabChange,
  onRightTabChange,
  onHorizontalLayoutChange,
  onCenterVerticalLayoutChange
}: {
  leftSidebar: ReactNode
  documentTabs: ReactNode
  documentView: ReactNode
  rightSidebar: ReactNode
  layout?: WorkbenchLayoutSettings
  leftTab: SidebarTab
  rightTab: RightSidebarTab
  onLeftTabChange: (tab: SidebarTab) => void
  onRightTabChange: (tab: RightSidebarTab) => void
  onHorizontalLayoutChange: (layout: Layout) => void
  onCenterVerticalLayoutChange: (layout: Layout) => void
}): React.JSX.Element {
  const leftPanelRef = useRef<PanelImperativeHandle>(null)
  const rightPanelRef = useRef<PanelImperativeHandle>(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  function toggleLeft(tab: SidebarTab): void {
    if (!leftCollapsed && leftTab === tab) {
      leftPanelRef.current?.collapse()
      return
    }
    onLeftTabChange(tab)
    leftPanelRef.current?.expand()
  }

  function toggleRight(tab: RightSidebarTab): void {
    if (!rightCollapsed && rightTab === tab) {
      rightPanelRef.current?.collapse()
      return
    }
    onRightTabChange(tab)
    rightPanelRef.current?.expand()
  }

  return (
    <div className="flex min-h-0 flex-1 bg-fd-background">
      <WorkbenchActivityBar>
        <ActivityButton
          active={!leftCollapsed && leftTab === 'files'}
          label="Explorer"
          onClick={() => toggleLeft('files')}
        >
          <FolderTree className="size-5" />
        </ActivityButton>
        <ActivityButton
          active={!leftCollapsed && leftTab === 'search'}
          label="Search"
          onClick={() => toggleLeft('search')}
        >
          <Search className="size-5" />
        </ActivityButton>
      </WorkbenchActivityBar>

      <div className="min-w-0 flex-1">
        <Group
          id="workbench-horizontal"
          orientation="horizontal"
          className="min-h-0 flex-1"
          defaultLayout={layout?.horizontal}
          onLayoutChanged={onHorizontalLayoutChange}
        >
          <Panel
            id="left-sidebar"
            panelRef={leftPanelRef}
            minSize="240px"
            defaultSize="280px"
            collapsible
            collapsedSize="0px"
            onResize={(size) => setLeftCollapsed(isCollapsed(size))}
          >
            {leftSidebar}
          </Panel>
          <WorkbenchResizeHandle orientation="vertical" />
          <Panel id="center" minSize="520px">
            <Group
              id="workbench-center-vertical"
              orientation="vertical"
              className="h-full min-h-0"
              defaultLayout={layout?.centerVertical}
              onLayoutChanged={onCenterVerticalLayoutChange}
            >
              <Panel id="document" minSize="320px" defaultSize="100%">
                <main className="flex h-full min-h-0 flex-col bg-fd-background">
                  {documentTabs}
                  <div className="min-h-0 flex-1 overflow-hidden">{documentView}</div>
                </main>
              </Panel>
            </Group>
          </Panel>
          <WorkbenchResizeHandle orientation="vertical" />
          <Panel
            id="right-sidebar"
            panelRef={rightPanelRef}
            minSize="240px"
            defaultSize="280px"
            collapsible
            collapsedSize="0px"
            onResize={(size) => setRightCollapsed(isCollapsed(size))}
          >
            {rightSidebar}
          </Panel>
        </Group>
      </div>

      <WorkbenchActivityBar>
        <ActivityButton
          active={!rightCollapsed && rightTab === 'outline'}
          label="Outline"
          onClick={() => toggleRight('outline')}
        >
          <ListTree className="size-5" />
        </ActivityButton>
        <ActivityButton
          active={!rightCollapsed && rightTab === 'ai'}
          label="AI"
          onClick={() => toggleRight('ai')}
        >
          <Bot className="size-5" />
        </ActivityButton>
      </WorkbenchActivityBar>
    </div>
  )
}

function WorkbenchActivityBar({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-x bg-fd-card py-2">
      {children}
    </div>
  )
}

function ActivityButton({
  active,
  label,
  onClick,
  children
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className="relative flex size-10 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-primary aria-pressed:before:absolute aria-pressed:before:inset-y-2 aria-pressed:before:left-0 aria-pressed:before:w-0.5 aria-pressed:before:rounded-full aria-pressed:before:bg-fd-primary"
    >
      {children}
    </button>
  )
}

function isCollapsed(size: PanelSize): boolean {
  return size.inPixels <= 1 || size.asPercentage <= 0.5
}

function WorkbenchResizeHandle({
  orientation
}: {
  orientation: 'horizontal' | 'vertical'
}): React.JSX.Element {
  return (
    <Separator
      className={
        orientation === 'vertical'
          ? 'group w-1 bg-transparent transition-colors hover:bg-fd-primary/20 data-[resize-handle-active]:bg-fd-primary/30'
          : 'group h-1 bg-transparent transition-colors hover:bg-fd-primary/20 data-[resize-handle-active]:bg-fd-primary/30'
      }
    />
  )
}
