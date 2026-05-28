import { FileText, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { m } from '../../../paraglide/messages'
import type { MdxWorkspace } from '../../../types'
import { buildFileTree, buildSingleFileTree, filterFileTree } from '../workspace-tree'
import { SidebarFilterInput } from './SidebarControls'
import { SidebarShell } from './SidebarShell'
import { useWorkspaceSidebarContextMenu } from './useWorkspaceSidebarContextMenu'
import { WorkspaceFilesPanel } from './WorkspaceFilesPanel'

export function WorkspaceFilesView({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  onDeletePath,
  opening
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
}): React.JSX.Element {
  const file = workspace.file
  const workspaceRoot = workspace.folder?.rootPath
  const hasWorkspaceFolder = Boolean(workspace.folder)
  const [fileFilterQuery, setFileFilterQuery] = useState('')
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const fileFilterInputRef = useRef<HTMLInputElement>(null)
  const workspaceSearchInputRef = useRef<HTMLInputElement>(null)
  const {
    contextMenu,
    setContextMenu,
    openContextMenu,
    copyPath,
    showInFolder,
    openInVsCode,
    deletePath
  } = useWorkspaceSidebarContextMenu({ onDeletePath, workspaceRoot })
  const tree = useMemo(
    () =>
      workspace.folder
        ? buildFileTree(workspace.folder.files, workspace.folder.tree, workspace.folder.rootPath)
        : buildSingleFileTree(file),
    [file, workspace.folder]
  )
  const filteredTree = useMemo(() => filterFileTree(tree, fileFilterQuery), [tree, fileFilterQuery])

  return (
    <SidebarShell
      title={
        <>
          <div className="flex items-center gap-2 font-medium">
            <span>{m.workbench_discover()}</span>
          </div>
          {workspace.folder ? (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
              <Search className="size-4 shrink-0" />
              <SidebarFilterInput
                activeTab="files"
                fileFilterInputRef={fileFilterInputRef}
                workspaceSearchInputRef={workspaceSearchInputRef}
                fileFilterQuery={fileFilterQuery}
                searchQuery=""
                onFileFilterQueryChange={setFileFilterQuery}
                onSearchQueryChange={() => undefined}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground">
              <FileText className="size-4" />
              <span>{m.preview_single_file_preview()}</span>
            </div>
          )}
        </>
      }
      onOpenFile={onOpenFile}
      onOpenFolder={onOpenFolder}
      opening={opening}
    >
      <WorkspaceFilesPanel
        activePath={file.path}
        activeName={file.name}
        workspaceRoot={workspaceRoot}
        hasWorkspaceFolder={hasWorkspaceFolder}
        fileFilterQuery={fileFilterQuery}
        nodes={filteredTree}
        renamingPath={renamingPath}
        contextMenu={contextMenu}
        onOpenPath={onOpenPath}
        onRenamePath={onRenamePath}
        onStartRename={setRenamingPath}
        onStopRename={() => setRenamingPath(null)}
        onOpenContextMenu={openContextMenu}
        onShowInFolder={(path) => void showInFolder(path)}
        onOpenInVsCode={(path) => void openInVsCode(path)}
        onCopyPath={(path) => void copyPath(path)}
        onDelete={(path) => void deletePath(path)}
        onSetContextMenu={setContextMenu}
      />
    </SidebarShell>
  )
}
