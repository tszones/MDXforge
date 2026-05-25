import { createPortal } from 'react-dom'
import { Copy } from 'lucide-react'
import { m } from '../../paraglide/messages'

export type FileTreeNodeContextMenuItem = {
  label: string
  icon?: React.ReactNode
  onSelect: () => void
}

export function FileTreeNodeContextMenu({
  menu,
  onCopyPath,
  onRename,
  items
}: {
  menu: { x: number; y: number; path: string } | null
  onCopyPath?: (path: string) => void
  onRename?: (path: string) => void
  items?: FileTreeNodeContextMenuItem[]
}): React.JSX.Element | null {
  if (!menu) return null

  return createPortal(
    <div
      className="fixed z-[9999] min-w-44 overflow-hidden rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg"
      style={{ left: menu.x, top: menu.y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items?.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
          onClick={item.onSelect}
        >
          {item.icon ?? <span className="size-4" />}
          {item.label}
        </button>
      ))}
      {onCopyPath ? (
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
          onClick={() => onCopyPath(menu.path)}
        >
          <Copy className="size-4 text-fd-primary" />
          {m.preview_copy_file_path()}
        </button>
      ) : null}
      {onRename ? (
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent hover:text-fd-accent-foreground"
          onClick={() => onRename(menu.path)}
        >
          <span className="size-4" />
          {m.preview_rename_item()}
        </button>
      ) : null}
    </div>,
    document.body
  )
}
