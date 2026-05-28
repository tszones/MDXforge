import { BookOpen, Bot, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import type { Layout, PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { Group, Panel } from 'react-resizable-panels'
import { m } from '../../paraglide/messages'
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

  function openLeftTab(tab: SidebarTab): void {
    onLeftTabChange(tab)
    leftPanelRef.current?.expand()
  }

  function toggleLeftPanel(): void {
    if (leftCollapsed) leftPanelRef.current?.expand()
    else leftPanelRef.current?.collapse()
  }

  function openRightPanel(): void {
    onRightTabChange('ai')
    rightPanelRef.current?.expand()
  }

  function toggleRightPanel(): void {
    if (rightCollapsed) rightPanelRef.current?.expand()
    else rightPanelRef.current?.collapse()
  }

  return (
    <div className="relative flex min-h-0 flex-1 bg-fd-background">
      {leftCollapsed ? (
        <div className="z-20 flex h-8 w-11 shrink-0 self-start justify-center">
          <IconButton label={m.preview_expand_sidebar()} onClick={toggleLeftPanel}>
            <PanelLeftOpen className="size-4" />
          </IconButton>
        </div>
      ) : null}

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
            <div className="flex h-full min-h-0 flex-col bg-fd-card">
              <div className="flex h-8 items-center gap-1 border-b px-2">
                <IconButton label={m.preview_collapse_sidebar()} onClick={toggleLeftPanel}>
                  <PanelLeftClose className="size-4" />
                </IconButton>
                <div className="mx-1 h-5 w-px bg-fd-border" />
                <TabIconButton
                  active={leftTab === 'files'}
                  label={m.workbench_discover()}
                  onClick={() => openLeftTab('files')}
                >
                  <BookOpen className="size-4" />
                </TabIconButton>
                <TabIconButton
                  active={leftTab === 'search'}
                  label={m.workbench_search()}
                  onClick={() => openLeftTab('search')}
                >
                  <Search className="size-4" />
                </TabIconButton>
              </div>
              <div className="min-h-0 flex-1">{leftSidebar}</div>
            </div>
          </Panel>
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
          <Panel
            id="right-sidebar"
            panelRef={rightPanelRef}
            minSize="240px"
            defaultSize="280px"
            collapsible
            collapsedSize="0px"
            onResize={(size) => setRightCollapsed(isCollapsed(size))}
          >
            <div className="flex h-full min-h-0 flex-col border-l bg-fd-card">
              <div className="flex h-8 items-center gap-1 border-b px-2">
                <IconButton label={m.preview_collapse_sidebar()} onClick={toggleRightPanel}>
                  <PanelRightClose className="size-4" />
                </IconButton>
                <div className="mx-1 h-5 w-px bg-fd-border" />
                <TabIconButton active={rightTab === 'ai'} label={m.workbench_ai()} onClick={openRightPanel}>
                  <Bot className="size-4" />
                </TabIconButton>
              </div>
              <div className="min-h-0 flex-1">{rightSidebar}</div>
            </div>
          </Panel>
        </Group>
      </div>

      {rightCollapsed ? (
        <div className="absolute right-0 top-0 z-20 flex h-8 w-11 justify-center">
          <IconButton label={m.preview_expand_sidebar()} onClick={toggleRightPanel}>
            <PanelRightOpen className="size-4" />
          </IconButton>
        </div>
      ) : null}
    </div>
  )
}

function TabIconButton({
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
      className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent/70 hover:text-fd-accent-foreground aria-pressed:bg-transparent aria-pressed:text-fd-foreground"
    >
      {children}
    </button>
  )
}

function IconButton({
  label,
  onClick,
  children
}: {
  label: string
  onClick: () => void
  children: ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent/70 hover:text-fd-accent-foreground"
    >
      {children}
    </button>
  )
}

function isCollapsed(size: PanelSize): boolean {
  return size.inPixels <= 1 || size.asPercentage <= 0.5
}
