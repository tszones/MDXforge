import { Code2, FileText, FolderOpen } from 'lucide-react'
import { m } from '../../../paraglide/messages'
import { FileTreeNodeContextMenu } from '../FileTreeNodeContextMenu'
import { FileTreeNodeView } from '../FileTreeNodeView'
import type { FileTreeNode } from '../workspace-tree'
import { getTreeNodeKey } from '../workspace-tree'
import type { SidebarContextMenuState } from './useWorkspaceSidebarContextMenu'
import { SidebarEmptyState } from './WorkspaceSearchPanel'

export function WorkspaceFilesPanel({
  activePath,
  activeName,
  workspaceRoot,
  hasWorkspaceFolder,
  fileFilterQuery,
  nodes,
  renamingPath,
  contextMenu,
  onOpenPath,
  onRenamePath,
  onStartRename,
  onStopRename,
  onOpenContextMenu,
  onShowInFolder,
  onOpenInVsCode,
  onCopyPath,
  onDelete,
  onSetContextMenu
}: {
  activePath: string
  activeName: string
  workspaceRoot?: string
  hasWorkspaceFolder: boolean
  fileFilterQuery: string
  nodes: FileTreeNode[]
  renamingPath: string | null
  contextMenu: SidebarContextMenuState
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onStartRename: (path: string) => void
  onStopRename: () => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
  onShowInFolder: (path: string) => void
  onOpenInVsCode: (path: string) => void
  onCopyPath: (path: string) => void
  onDelete: (path: string) => void
  onSetContextMenu: (menu: SidebarContextMenuState) => void
}): React.JSX.Element {
  return (
    <>
      <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
        {hasWorkspaceFolder && fileFilterQuery.trim().length > 0
          ? m.preview_filtered_files()
          : hasWorkspaceFolder
            ? m.preview_files_nav()
            : m.preview_current_file()}
      </p>
      {nodes.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {nodes.map((node, index) => (
            <FileTreeNodeView
              key={getTreeNodeKey(node, index)}
              node={node}
              activePath={activePath}
              onOpenPath={(filePath) => onOpenPath(filePath, workspaceRoot)}
              onRenamePath={(targetPath, nextName) =>
                onRenamePath(targetPath, nextName, workspaceRoot)
              }
              renamingPath={renamingPath}
              onStartRename={onStartRename}
              onStopRename={onStopRename}
              onOpenContextMenu={onOpenContextMenu}
            />
          ))}
          <FileTreeNodeContextMenu
            menu={contextMenu}
            items={[
              {
                label: m.preview_show_in_folder(),
                icon: <FolderOpen className="size-4 text-fd-primary" />,
                onSelect: () => onShowInFolder(contextMenu?.path ?? '')
              },
              {
                label: m.preview_open_in_vscode(),
                icon: <Code2 className="size-4 text-fd-primary" />,
                onSelect: () => onOpenInVsCode(contextMenu?.path ?? '')
              }
            ]}
            onCopyPath={(path) => onCopyPath(path)}
            onDelete={(path) => onDelete(path)}
            onRename={(path) => {
              onSetContextMenu(null)
              onStartRename(path)
            }}
          />
        </div>
      ) : hasWorkspaceFolder ? (
        <SidebarEmptyState>
          {fileFilterQuery.trim().length > 0
            ? m.preview_no_file_matches()
            : m.preview_empty_files()}
        </SidebarEmptyState>
      ) : (
        <div className="relative flex flex-row items-center gap-2 rounded-lg bg-fd-primary/10 p-2 text-start text-fd-primary wrap-anywhere">
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{activeName}</span>
        </div>
      )}
    </>
  )
}
