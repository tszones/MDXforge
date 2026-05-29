import { useMemo, useState } from 'react'
import type { Layout } from 'react-resizable-panels'
import { useWorkbenchTabs } from '../hooks/useWorkbenchTabs'
import { m } from '../paraglide/messages'
import type { AskAiButtonAction, MdxWorkspace, WorkbenchLayoutSettings } from '../types'
import { MdxDocumentView } from './preview/MdxDocumentView'
import type { SidebarTab } from './preview/sidebar/useWorkspaceSidebarTabs'
import { PreviewSidebar } from './preview/WorkspaceSidebar'
import { DocumentTabs } from './workbench/DocumentTabs'
import { RightSidebar } from './workbench/RightSidebar'
import { WorkbenchLayout } from './workbench/WorkbenchLayout'

interface MdxPreviewProps {
  workspace: MdxWorkspace
  setWorkspace: (workspace: MdxWorkspace | null) => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => Promise<MdxWorkspace | null>
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  workbenchLayout?: WorkbenchLayoutSettings
  askAiButtonAction: AskAiButtonAction
  onWorkbenchLayoutChange: (layout: WorkbenchLayoutSettings) => void
}

export function MdxPreview({
  workspace,
  setWorkspace,
  onOpenPath,
  onRenamePath,
  onDeletePath,
  workbenchLayout,
  askAiButtonAction,
  onWorkbenchLayoutChange
}: MdxPreviewProps): React.JSX.Element {
  const [leftSidebarTab, setLeftSidebarTab] = useState<SidebarTab>('files')
  const { tabs, activeTabId, activeTab, openOrActivate, activate, close } = useWorkbenchTabs({
    workspace,
    setWorkspace,
    openPath: onOpenPath
  })
  const activeFile = activeTab?.file ?? workspace.file
  const activeWorkspace = useMemo(
    () => ({ ...workspace, file: activeFile }),
    [activeFile, workspace]
  )

  function updateWorkbenchLayout(
    key: keyof WorkbenchLayoutSettings,
    layout: Layout | boolean,
    bottomPanelOpen?: boolean
  ): void {
    onWorkbenchLayoutChange({
      ...workbenchLayout,
      [key]: layout,
      ...(typeof bottomPanelOpen === 'boolean' ? { bottomPanelOpen } : {})
    })
  }

  return (
    <WorkbenchLayout
      layout={workbenchLayout}
      leftTab={leftSidebarTab}
      showLeftSidebar={Boolean(activeWorkspace.folder)}
      onLeftTabChange={setLeftSidebarTab}
      askAiButtonAction={askAiButtonAction}
      onHorizontalLayoutChange={(layout) => updateWorkbenchLayout('horizontal', layout)}
      onCenterVerticalLayoutChange={(layout, bottomPanelOpen) =>
        updateWorkbenchLayout('centerVertical', layout, bottomPanelOpen)
      }
      leftSidebar={
        <PreviewSidebar
          workspace={activeWorkspace}
          onOpenPath={(filePath, workspaceRoot, options) =>
            void openOrActivate(filePath, workspaceRoot, options)
          }
          onRenamePath={onRenamePath}
          onDeletePath={onDeletePath}
          activeTab={leftSidebarTab}
          onActiveTabChange={setLeftSidebarTab}
        />
      }
      documentTabs={
        <DocumentTabs tabs={tabs} activeTabId={activeTabId} onActivate={activate} onClose={close} />
      }
      documentView={
        activeFile ? (
          <MdxDocumentView
            workspace={activeWorkspace}
            file={activeFile}
            onOpenPath={(filePath, workspaceRoot, options) =>
              void openOrActivate(filePath, workspaceRoot, options)
            }
            tocPinned={Boolean(workbenchLayout?.tocPinned)}
            onTocPinnedChange={(pinned) => updateWorkbenchLayout('tocPinned', pinned)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-fd-muted-foreground">
            {m.workbench_no_open_tabs()}
          </div>
        )
      }
      rightSidebar={<RightSidebar file={activeFile} />}
    />
  )
}
