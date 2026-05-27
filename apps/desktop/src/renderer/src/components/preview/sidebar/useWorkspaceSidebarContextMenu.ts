import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { m } from '../../../paraglide/messages'

export type SidebarContextMenuState = { x: number; y: number; path: string } | null

export function useWorkspaceSidebarContextMenu({
  onDeletePath,
  workspaceRoot
}: {
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  workspaceRoot?: string
}): {
  contextMenu: SidebarContextMenuState
  setContextMenu: (menu: SidebarContextMenuState) => void
  openContextMenu: (event: React.MouseEvent, path: string) => void
  copyPath: (path: string) => Promise<void>
  showInFolder: (path: string) => Promise<void>
  openInVsCode: (path: string) => Promise<void>
  deletePath: (path: string) => Promise<void>
} {
  const [contextMenu, setContextMenu] = useState<SidebarContextMenuState>(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = (): void => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', close)
    }
  }, [contextMenu])

  function openContextMenu(event: React.MouseEvent, path: string): void {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY, path })
  }

  async function copyPath(path: string): Promise<void> {
    setContextMenu(null)
    try {
      await window.api.copyPath(path)
      toast.success(m.preview_file_path_copied())
    } catch {
      toast.error(m.preview_file_path_copy_failed())
    }
  }

  async function showInFolder(path: string): Promise<void> {
    setContextMenu(null)
    await window.api.showInFolder(path)
  }

  async function openInVsCode(path: string): Promise<void> {
    setContextMenu(null)
    await window.api.openInVsCode(path)
  }

  async function deletePath(path: string): Promise<void> {
    setContextMenu(null)
    await onDeletePath(path, workspaceRoot)
  }

  return {
    contextMenu,
    setContextMenu,
    openContextMenu,
    copyPath,
    showInFolder,
    openInVsCode,
    deletePath
  }
}
