import { useHotkeys } from '@tanstack/react-hotkeys'
import { PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Layout, PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { Group, Panel } from 'react-resizable-panels'
import { appHotkeys } from '../../lib/hotkeys'
import { m } from '../../paraglide/messages'
import type { WorkbenchLayoutSettings } from '../../types'
import type { SidebarTab } from '../preview/sidebar/useWorkspaceSidebarTabs'
import { useWindowSize } from '../../hooks/useWindowSize'
import { BottomPanel, type BottomPanelTab } from './BottomPanel'
import { WorkbenchIconButton } from './WorkbenchIconButton'
import { WorkbenchLeftPanelHeader, WorkbenchRightPanelHeader } from './WorkbenchPanelHeader'
import { WorkbenchSidePanel } from './WorkbenchSidePanel'

const NARROW_BREAKPOINT = 1100
const MEDIUM_BREAKPOINT = 1366

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
  onCenterVerticalLayoutChange: (layout: Layout, bottomPanelOpen?: boolean) => void
}): React.JSX.Element {
  const { width } = useWindowSize()
  const isNarrow = width < NARROW_BREAKPOINT
  const isMedium = width >= NARROW_BREAKPOINT && width < MEDIUM_BREAKPOINT

  const leftPanelRef = useRef<PanelImperativeHandle>(null)
  const rightPanelRef = useRef<PanelImperativeHandle>(null)
  const bottomPanelRef = useRef<PanelImperativeHandle>(null)
  const [leftCollapsed, setLeftCollapsed] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < NARROW_BREAKPOINT : false)
  )
  const [rightCollapsed, setRightCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.innerWidth < NARROW_BREAKPOINT || window.innerWidth < MEDIUM_BREAKPOINT)
  )
  const [bottomPanelOpen, setBottomPanelOpen] = useState(Boolean(layout?.bottomPanelOpen))
  const lastOpenCenterVerticalLayoutRef = useRef<Layout | undefined>(
    isBottomPanelLayoutOpen(layout?.centerVertical) ? layout?.centerVertical : undefined
  )
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal')
  const prevIsNarrowRef = useRef(isNarrow)
  const prevIsMediumRef = useRef(isMedium)

  // Collapse right sidebar on first mount at medium screen
  useEffect(() => {
    if (!isNarrow && rightCollapsed && rightPanelRef.current) {
      rightPanelRef.current.collapse()
    }
    if (leftCollapsed && leftPanelRef.current) {
      leftPanelRef.current.collapse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-collapse sidebars when resizing into narrow mode
  useEffect(() => {
    if (isNarrow && !prevIsNarrowRef.current) {
      setLeftCollapsed(true)
      setRightCollapsed(true)
    }
    prevIsNarrowRef.current = isNarrow
  }, [isNarrow])

  // Auto-collapse right sidebar when entering medium screen
  useEffect(() => {
    if (isMedium && !prevIsMediumRef.current) {
      setRightCollapsed(true)
    }
    prevIsMediumRef.current = isMedium
  }, [isMedium])

  useEffect(() => {
    if (layout?.bottomPanelOpen) bottomPanelRef.current?.resize(getStoredBottomPanelSize())
    else bottomPanelRef.current?.collapse()
  }, [layout?.bottomPanelOpen])

  useHotkeys(
    [
      {
        hotkey: appHotkeys.toggleBottomPanel,
        callback: toggleBottomPanel,
        options: {
          meta: {
            name: 'Toggle bottom panel',
            description: 'Show or hide the workbench bottom panel.'
          }
        }
      }
    ],
    { ignoreInputs: true }
  )

  function openLeftTab(tab: SidebarTab): void {
    onLeftTabChange(tab)
    if (isNarrow) {
      setLeftCollapsed(false)
      return
    }
    leftPanelRef.current?.expand()
  }

  function toggleLeftPanel(): void {
    if (isNarrow) {
      setLeftCollapsed((prev) => !prev)
      return
    }
    if (leftCollapsed) leftPanelRef.current?.expand()
    else leftPanelRef.current?.collapse()
  }

  function openRightPanel(): void {
    if (isNarrow) {
      setRightCollapsed(false)
      return
    }
    rightPanelRef.current?.expand()
  }

  function toggleRightPanel(): void {
    if (isNarrow) {
      setRightCollapsed((prev) => !prev)
      return
    }
    if (rightCollapsed) rightPanelRef.current?.expand()
    else rightPanelRef.current?.collapse()
  }

  function toggleBottomPanel(): void {
    if (bottomPanelOpen) {
      bottomPanelRef.current?.collapse()
      onCenterVerticalLayoutChange(
        lastOpenCenterVerticalLayoutRef.current ?? layout?.centerVertical ?? {},
        false
      )
      return
    }

    bottomPanelRef.current?.resize(getStoredBottomPanelSize())
  }

  function getStoredBottomPanelSize(): string {
    const bottomSize =
      lastOpenCenterVerticalLayoutRef.current?.bottom ?? layout?.centerVertical?.bottom
    return bottomSize && bottomSize > 0.5 ? `${bottomSize}%` : '180px'
  }

  function syncCenterVerticalLayout(nextLayout: Layout): void {
    if (isBottomPanelLayoutOpen(nextLayout)) lastOpenCenterVerticalLayoutRef.current = nextLayout
    const bottomSize = nextLayout.bottom ?? bottomPanelRef.current?.getSize().asPercentage ?? 0
    onCenterVerticalLayoutChange(
      isBottomPanelLayoutOpen(nextLayout)
        ? nextLayout
        : (lastOpenCenterVerticalLayoutRef.current ?? nextLayout),
      bottomSize > 0.5
    )
  }

  function syncBottomPanelState(size: PanelSize): void {
    setBottomPanelOpen(!isCollapsed(size))
  }

  function handleAskAi(): void {
    if (askAiButtonAction === 'open-sidebar') openRightPanel()
    onAskAi?.()
  }

  function closeAllNarrowOverlays(): void {
    if (!leftCollapsed) setLeftCollapsed(true)
    if (!rightCollapsed) setRightCollapsed(true)
  }

  const anyOverlayOpen = isNarrow && (!leftCollapsed || !rightCollapsed)

  const centerContent = (
    <Group
      id="workbench-center-vertical"
      orientation="vertical"
      className="h-full min-h-0"
      defaultLayout={layout?.centerVertical}
      onLayoutChanged={syncCenterVerticalLayout}
    >
      <Panel id="document" minSize="320px" defaultSize="100%">
        <main className="flex h-full min-h-0 flex-col bg-fd-background">
          {documentTabs}
          <div className="min-h-0 flex-1 overflow-hidden">{documentView}</div>
        </main>
      </Panel>
      <Panel
        id="bottom"
        panelRef={bottomPanelRef}
        minSize="120px"
        defaultSize={layout?.bottomPanelOpen ? getStoredBottomPanelSize() : '0px'}
        collapsible
        collapsedSize="0px"
        onResize={syncBottomPanelState}
      >
        <BottomPanel activeTab={bottomPanelTab} onActiveTabChange={setBottomPanelTab} />
      </Panel>
    </Group>
  )

  return (
    <div className="relative flex min-h-0 flex-1 bg-fd-background">
      {/* Left toggle button (collapsed) — floating, does not occupy layout space */}
      {showLeftSidebar && leftCollapsed ? (
        <div className="absolute top-0 left-0 z-20 flex h-9 w-9 items-center justify-center">
          <WorkbenchIconButton label={m.preview_expand_sidebar()} onClick={toggleLeftPanel}>
            <PanelLeftOpen className="size-4" />
          </WorkbenchIconButton>
        </div>
      ) : null}

      {isNarrow ? (
        // Narrow: center fills all space, sidebars render as overlays
        <div className="min-w-0 flex-1">{centerContent}</div>
      ) : (
        // Wide: horizontal group with resizable side panels
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
            <Panel id="center" minSize="440px">
              {centerContent}
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
      )}

      {/* Narrow overlay backdrop (closes any open overlay) */}
      {anyOverlayOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200"
          onClick={closeAllNarrowOverlays}
        />
      ) : null}

      {/* Narrow left overlay */}
      {isNarrow && showLeftSidebar ? (
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-fd-card shadow-lg transition-transform duration-200 ${
            leftCollapsed ? '-translate-x-full' : 'translate-x-0'
          }`}
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
        </div>
      ) : null}

      {/* Narrow right overlay */}
      {isNarrow ? (
        <div
          className={`fixed inset-y-0 right-0 z-40 w-72 bg-fd-card shadow-lg transition-transform duration-200 ${
            rightCollapsed ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <WorkbenchSidePanel
            side="right"
            header={<WorkbenchRightPanelHeader onCollapse={toggleRightPanel} />}
          >
            {rightSidebar}
          </WorkbenchSidePanel>
        </div>
      ) : null}

      {/* Ask AI FAB (visible when right panel is collapsed) */}
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

function isBottomPanelLayoutOpen(layout?: Layout): boolean {
  return typeof layout?.bottom === 'number' && layout.bottom > 0.5
}

function isCollapsed(size: PanelSize): boolean {
  return size.inPixels <= 1 || size.asPercentage <= 0.5
}
