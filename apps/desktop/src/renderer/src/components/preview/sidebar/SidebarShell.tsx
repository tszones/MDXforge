import { FileText, FolderOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { m } from '../../../paraglide/messages'

export function SidebarShell({
  title,
  children,
  onOpenFile,
  onOpenFolder,
  opening
}: {
  title: ReactNode
  children: ReactNode
  onOpenFile: () => void
  onOpenFolder: () => void
  opening: boolean
}): React.JSX.Element {
  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">{title}</div>
        <div className="fd-scroll-container min-h-0 flex-1 overflow-auto px-3 py-2 [mask:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]">
          {children}
        </div>
        <div className="border-t p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenFile}
              disabled={opening}
              title={opening ? m.actions_opening() : m.actions_open_mdx_file()}
              className="inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-fd-secondary/50 px-2 text-center text-xs leading-none text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FileText className="size-3.5 shrink-0 text-fd-muted-foreground" />
              <span className="truncate">
                {opening ? m.actions_opening() : m.actions_open_mdx_file()}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenFolder}
              disabled={opening}
              title={m.actions_open_folder()}
              className="inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-fd-secondary/50 px-2 text-center text-xs leading-none text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FolderOpen className="size-3.5 shrink-0 text-fd-muted-foreground" />
              <span className="truncate">{m.actions_open_folder()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
