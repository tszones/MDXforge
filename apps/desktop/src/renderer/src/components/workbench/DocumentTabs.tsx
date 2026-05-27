import { FileText, X } from 'lucide-react'
import type { MdxFile } from '../../types'

export interface WorkbenchDocumentTab {
  id: string
  file: MdxFile
}

export function DocumentTabs({
  tabs,
  activeTabId,
  onActivate,
  onClose
}: {
  tabs: WorkbenchDocumentTab[]
  activeTabId: string | null
  onActivate: (tabId: string) => void
  onClose: (tabId: string) => void
}): React.JSX.Element {
  return (
    <div className="flex h-10 shrink-0 items-center overflow-x-auto border-b bg-fd-card">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          data-active={tab.id === activeTabId}
          className="group flex h-full max-w-56 min-w-32 items-center border-r text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent/60 hover:text-fd-accent-foreground data-[active=true]:bg-fd-background data-[active=true]:text-fd-foreground"
        >
          <button
            type="button"
            onClick={() => onActivate(tab.id)}
            className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-start"
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{tab.file.name}</span>
          </button>
          <button
            type="button"
            aria-label={`Close ${tab.file.name}`}
            onClick={() => onClose(tab.id)}
            className="me-2 rounded p-0.5 opacity-60 transition-opacity hover:bg-fd-accent hover:opacity-100 group-hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
