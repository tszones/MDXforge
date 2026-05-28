import { useMemo, useState } from 'react'
import type { Layout } from 'react-resizable-panels'
import { useWorkbenchTabs } from '../hooks/useWorkbenchTabs'
import { m } from '../paraglide/messages'
import type { MdxWorkspace, WorkbenchLayoutSettings } from '../types'
import { MdxDocumentView } from './preview/MdxDocumentView'
import type { SidebarTab } from './preview/sidebar/useWorkspaceSidebarTabs'
import { PreviewSidebar } from './preview/WorkspaceSidebar'
import { DocumentTabs } from './workbench/DocumentTabs'
import { RightSidebar, type RightSidebarTab } from './workbench/RightSidebar'
import { WorkbenchLayout } from './workbench/WorkbenchLayout'

interface MdxPreviewProps {
  workspace: MdxWorkspace
  setWorkspace: (workspace: MdxWorkspace | null) => void
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => Promise<MdxWorkspace | null>
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
  workbenchLayout?: WorkbenchLayoutSettings
  onWorkbenchLayoutChange: (layout: WorkbenchLayoutSettings) => void
}

export function MdxPreview({
  workspace,
  setWorkspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  onDeletePath,
  opening,
  workbenchLayout,
  onWorkbenchLayoutChange
}: MdxPreviewProps): React.JSX.Element {
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('ai')
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

  function updateWorkbenchLayout(key: keyof WorkbenchLayoutSettings, layout: Layout): void {
    onWorkbenchLayoutChange({
      ...workbenchLayout,
      [key]: layout
    })
  }

  return (
    <WorkbenchLayout
      layout={workbenchLayout}
      leftTab={leftSidebarTab}
      rightTab={rightSidebarTab}
      onLeftTabChange={setLeftSidebarTab}
      onRightTabChange={setRightSidebarTab}
      onHorizontalLayoutChange={(layout) => updateWorkbenchLayout('horizontal', layout)}
      onCenterVerticalLayoutChange={(layout) => updateWorkbenchLayout('centerVertical', layout)}
      leftSidebar={
        <PreviewSidebar
          workspace={activeWorkspace}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onOpenPath={(filePath, workspaceRoot) => void openOrActivate(filePath, workspaceRoot)}
          onRenamePath={onRenamePath}
          onDeletePath={onDeletePath}
          opening={opening}
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
            onOpenPath={(filePath, workspaceRoot) => void openOrActivate(filePath, workspaceRoot)}
            onTocChange={() => undefined}
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
