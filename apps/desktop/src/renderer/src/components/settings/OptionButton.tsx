import { Check } from 'lucide-react'
import { m } from '../../paraglide/messages'

export function OptionButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:border-fd-primary data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
    >
      {children}
    </button>
  )
}

export function SelectionBadge({ active }: { active: boolean }): React.JSX.Element {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-fd-card px-2 py-0.5 text-xs text-fd-muted-foreground">
      {active ? <Check className="size-3" /> : null}
      {active ? m.settings_current() : m.settings_select()}
    </span>
  )
}
