import { PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import type { Layout, PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { Group, Panel } from 'react-resizable-panels'
import { m } from '../../paraglide/messages'
import type { WorkbenchLayoutSettings } from '../../types'
import type { SidebarTab } from '../preview/sidebar/useWorkspaceSidebarTabs'
import { WorkbenchIconButton } from './WorkbenchIconButton'
import { WorkbenchLeftPanelHeader, WorkbenchRightPanelHeader } from './WorkbenchPanelHeader'
import { WorkbenchSidePanel } from './WorkbenchSidePanel'

export function WorkbenchLayout({
  leftSidebar,
  documentTabs,
  documentView,
  rightSidebar,
  layout,
  leftTab,
  showLeftSidebar = true,
  onLeftTabChange,
  askAiButtonAction,
  onAskAi,
  onHorizontalLayoutChange,
  onCenterVerticalLayoutChange
}: {
  leftSidebar: ReactNode
  documentTabs: ReactNode
  documentView: ReactNode
  rightSidebar: ReactNode
  layout?: WorkbenchLayoutSettings
  leftTab: SidebarTab
  showLeftSidebar?: boolean
  onLeftTabChange: (tab: SidebarTab) => void
  askAiButtonAction?: 'open-sidebar'
  onAskAi?: () => void
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
    rightPanelRef.current?.expand()
  }

  function toggleRightPanel(): void {
    if (rightCollapsed) rightPanelRef.current?.expand()
    else rightPanelRef.current?.collapse()
  }

  function handleAskAi(): void {
    if (askAiButtonAction === 'open-sidebar') openRightPanel()
    onAskAi?.()
  }

  return (
    <div className="relative flex min-h-0 flex-1 bg-fd-background">
      {showLeftSidebar && leftCollapsed ? (
        <div className="z-20 flex h-8 w-11 shrink-0 self-start justify-center">
          <WorkbenchIconButton label={m.preview_expand_sidebar()} onClick={toggleLeftPanel}>
            <PanelLeftOpen className="size-4" />
          </WorkbenchIconButton>
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
          {showLeftSidebar ? (
            <Panel
              id="left-sidebar"
              panelRef={leftPanelRef}
              minSize="240px"
              defaultSize="280px"
              collapsible
              collapsedSize="0px"
              onResize={(size) => setLeftCollapsed(isCollapsed(size))}
            >
              <WorkbenchSidePanel
                side="left"
                header={
                  <WorkbenchLeftPanelHeader
                    activeTab={leftTab}
                    onTabChange={openLeftTab}
                    onCollapse={toggleLeftPanel}
                  />
                }
              >
                {leftSidebar}
              </WorkbenchSidePanel>
            </Panel>
          ) : null}
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
            <WorkbenchSidePanel
              side="right"
              header={<WorkbenchRightPanelHeader onCollapse={toggleRightPanel} />}
            >
              {rightSidebar}
            </WorkbenchSidePanel>
          </Panel>
        </Group>
      </div>

      {rightCollapsed ? (
        <button
          type="button"
          onClick={handleAskAi}
          className="fixed right-5 bottom-5 z-30 rounded-full border border-fd-primary/20 bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground shadow-lg shadow-fd-primary/20 transition-colors hover:bg-fd-primary/90"
        >
          {m.workbench_ask_ai()}
        </button>
      ) : null}
    </div>
  )
}

function isCollapsed(size: PanelSize): boolean {
  return size.inPixels <= 1 || size.asPercentage <= 0.5
}
