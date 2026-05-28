import type { ReactNode } from 'react'

export function WorkbenchIconButton({
  label,
  onClick,
  children
}: {
  label: string
  onClick: () => void
  children: ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent/70 hover:text-fd-accent-foreground"
    >
      {children}
    </button>
  )
}

export function WorkbenchTabIconButton({
  active,
  label,
  onClick,
  children
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent/70 hover:text-fd-accent-foreground aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-primary"
    >
      {children}
    </button>
  )
}
