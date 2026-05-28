import { X } from 'lucide-react'
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
  if (tabs.length <= 1) return <></>

  return (
    <div className="flex h-8 shrink-0 items-center overflow-x-auto bg-fd-background/80 px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          data-active={tab.id === activeTabId}
          className="group flex h-7 max-w-44 min-w-0 items-center rounded-md px-1 text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent/40 hover:text-fd-accent-foreground data-[active=true]:text-fd-foreground"
        >
          <button
            type="button"
            onClick={() => onActivate(tab.id)}
            className="flex h-full min-w-0 flex-1 items-center px-2 text-start"
          >
            <span className="truncate">{tab.file.name}</span>
          </button>
          <button
            type="button"
            aria-label={`Close ${tab.file.name}`}
            onClick={() => onClose(tab.id)}
            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-fd-accent hover:opacity-100 group-hover:opacity-60 data-[active=true]:opacity-50"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
