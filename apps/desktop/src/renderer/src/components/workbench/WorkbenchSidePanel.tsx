import type { ReactNode } from 'react'

export function WorkbenchSidePanel({
  side,
  header,
  children
}: {
  side: 'left' | 'right'
  header: ReactNode
  children: ReactNode
}): React.JSX.Element {
  return (
    <div
      data-side={side}
      className="flex h-full min-h-0 flex-col bg-fd-card data-[side=right]:border-l"
    >
      {header}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
