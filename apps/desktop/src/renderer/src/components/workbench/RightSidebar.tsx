import type { TOCItemType } from 'fumadocs-core/toc'
import { Bot, ListTree } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { MdxFile } from '../../types'
import { AiChatPanel } from './AiChatPanel'
import { OutlinePanel } from './OutlinePanel'

export type RightSidebarTab = 'outline' | 'ai'

export function RightSidebar({
  activeTab,
  onActiveTabChange,
  file,
  toc
}: {
  activeTab: RightSidebarTab
  onActiveTabChange: (tab: RightSidebarTab) => void
  file: MdxFile | null
  toc: TOCItemType[]
}): React.JSX.Element {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l bg-fd-card text-sm">
      <div className="flex h-10 shrink-0 items-center border-b px-2">
        <RightSidebarButton
          active={activeTab === 'outline'}
          icon={<ListTree className="size-4" />}
          label={m.workbench_tab_outline()}
          onClick={() => onActiveTabChange('outline')}
        />
        <RightSidebarButton
          active={activeTab === 'ai'}
          icon={<Bot className="size-4" />}
          label={m.workbench_tab_ai()}
          onClick={() => onActiveTabChange('ai')}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {activeTab === 'outline' ? <OutlinePanel toc={toc} /> : <AiChatPanel file={file} />}
      </div>
    </aside>
  )
}

function RightSidebarButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-primary"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
