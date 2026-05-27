import { AlertTriangle, FileTerminal, ListChecks } from 'lucide-react'
import { m } from '../../paraglide/messages'

export type BottomPanelTab = 'terminal' | 'problems' | 'output'

export function BottomPanel({
  activeTab,
  onActiveTabChange
}: {
  activeTab: BottomPanelTab
  onActiveTabChange: (tab: BottomPanelTab) => void
}): React.JSX.Element {
  return (
    <section className="flex h-full min-h-0 flex-col border-t bg-fd-card text-sm">
      <div className="flex h-9 shrink-0 items-center border-b px-2">
        <BottomPanelButton
          active={activeTab === 'terminal'}
          icon={<FileTerminal className="size-4" />}
          label={m.workbench_tab_terminal()}
          onClick={() => onActiveTabChange('terminal')}
        />
        <BottomPanelButton
          active={activeTab === 'problems'}
          icon={<AlertTriangle className="size-4" />}
          label={m.workbench_tab_problems()}
          onClick={() => onActiveTabChange('problems')}
        />
        <BottomPanelButton
          active={activeTab === 'output'}
          icon={<ListChecks className="size-4" />}
          label={m.workbench_tab_output()}
          onClick={() => onActiveTabChange('output')}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs">
        {activeTab === 'terminal' ? <TerminalPanel /> : null}
        {activeTab === 'problems' ? <ProblemsPanel /> : null}
        {activeTab === 'output' ? <OutputPanel /> : null}
      </div>
    </section>
  )
}

function TerminalPanel(): React.JSX.Element {
  return <PanelPlaceholder text={m.workbench_terminal_placeholder()} />
}

function ProblemsPanel(): React.JSX.Element {
  return <PanelPlaceholder text={m.workbench_problems_placeholder()} />
}

function OutputPanel(): React.JSX.Element {
  return <PanelPlaceholder text={m.workbench_output_placeholder()} />
}

function PanelPlaceholder({ text }: { text: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed p-4 font-sans text-fd-muted-foreground text-sm">
      {text}
    </div>
  )
}

function BottomPanelButton({
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
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-primary"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
