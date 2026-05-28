import type { ReactNode } from 'react'

export function SidebarShell({
  title,
  children
}: {
  title: ReactNode
  children: ReactNode
}): React.JSX.Element {
  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">{title}</div>
        <div className="fd-scroll-container min-h-0 flex-1 overflow-auto px-3 py-2 [mask:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]">
          {children}
        </div>
      </div>
    </div>
  )
}
