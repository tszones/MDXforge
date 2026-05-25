import { createPortal } from 'react-dom'
import { Copy } from 'lucide-react'
import { m } from '../../paraglide/messages'

export function FileTreeNodeContextMenu({
  menu,
  onCopyPath,
  onRename
}: {
  menu: { x: number; y: number; path: string } | null
  onCopyPath: (path: string) => void
  onRename: (path: string) => void
}): React.JSX.Element | null {
  if (!menu) return null

  return createPortal(
    <div
      className="fixed z-[9999] min-w-44 overflow-hidden rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg"
      style={{ left: menu.x, top: menu.y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
        onClick={() => onCopyPath(menu.path)}
      >
        <Copy className="size-4 text-fd-primary" />
        {m.preview_copy_file_path()}
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
        onClick={() => onRename(menu.path)}
      >
        <span className="size-4" />
        {m.preview_rename_item()}
      </button>
    </div>,
    document.body
  )
}
