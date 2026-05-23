import { ArrowLeft, Maximize2, Minus, Settings, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { m } from '../paraglide/messages'

export function WindowTitleBar({
  viewMode,
  onViewModeChange
}: {
  viewMode: 'preview' | 'settings'
  onViewModeChange: (viewMode: 'preview' | 'settings') => void
}): React.JSX.Element {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    void window.api.isWindowMaximized().then(setMaximized)
  }, [])

  async function toggleMaximize(): Promise<void> {
    setMaximized(await window.api.maximizeWindow())
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-10 select-none items-center border-b bg-fd-background/95 backdrop-blur supports-[backdrop-filter]:bg-fd-background/80 [-webkit-app-region:drag]">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 text-sm font-medium text-fd-muted-foreground">
        <span className="size-2 rounded-full bg-fd-primary" />
        <span className="truncate">MDXForge</span>
      </div>
      <div className="flex h-full [-webkit-app-region:no-drag]">
        <TitleBarButton
          label={viewMode === 'settings' ? m.title_bar_back_to_preview() : m.title_bar_settings()}
          onClick={() => onViewModeChange(viewMode === 'settings' ? 'preview' : 'settings')}
        >
          {viewMode === 'settings' ? (
            <ArrowLeft className="size-4" />
          ) : (
            <Settings className="size-4" />
          )}
        </TitleBarButton>
        <TitleBarButton
          label={m.title_bar_minimize()}
          onClick={() => void window.api.minimizeWindow()}
        >
          <Minus className="size-4" />
        </TitleBarButton>
        <TitleBarButton
          label={maximized ? m.title_bar_restore() : m.title_bar_maximize()}
          onClick={() => void toggleMaximize()}
        >
          {maximized ? <Square className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </TitleBarButton>
        <TitleBarButton
          label={m.title_bar_close()}
          danger
          onClick={() => void window.api.closeWindow()}
        >
          <X className="size-4" />
        </TitleBarButton>
      </div>
    </header>
  )
}

function TitleBarButton({
  label,
  danger,
  onClick,
  children
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-full w-11 items-center justify-center text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[danger=true]:hover:bg-red-500 data-[danger=true]:hover:text-white"
      data-danger={danger}
    >
      {children}
    </button>
  )
}
