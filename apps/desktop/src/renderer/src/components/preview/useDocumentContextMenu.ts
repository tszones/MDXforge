import { useEffect, useState } from 'react'

export interface DocumentContextMenuState {
  x: number
  y: number
  path: string
}

export function useDocumentContextMenu(filePath: string): {
  documentContextMenu: DocumentContextMenuState | null
  closeDocumentContextMenu: () => void
  openDocumentContextMenu: (event: React.MouseEvent) => void
  showDocumentInFolder: () => Promise<void>
  openDocumentInVsCode: () => Promise<void>
} {
  const [documentContextMenu, setDocumentContextMenu] = useState<DocumentContextMenuState | null>(
    null
  )

  useEffect(() => {
    if (!documentContextMenu) return
    const close = (): void => setDocumentContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', close)
    }
  }, [documentContextMenu])

  function closeDocumentContextMenu(): void {
    setDocumentContextMenu(null)
  }

  function openDocumentContextMenu(event: React.MouseEvent): void {
    event.preventDefault()
    setDocumentContextMenu({ x: event.clientX, y: event.clientY, path: filePath })
  }

  async function showDocumentInFolder(): Promise<void> {
    closeDocumentContextMenu()
    await window.api.showInFolder(filePath)
  }

  async function openDocumentInVsCode(): Promise<void> {
    closeDocumentContextMenu()
    await window.api.openInVsCode(filePath)
  }

  return {
    documentContextMenu,
    closeDocumentContextMenu,
    openDocumentContextMenu,
    showDocumentInFolder,
    openDocumentInVsCode
  }
}
