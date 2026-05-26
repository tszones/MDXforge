import { IconBrandGithub } from '@tabler/icons-react'
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Maximize2,
  Minus,
  Moon,
  RefreshCw,
  Settings,
  Square,
  Sun,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import appIcon from '../../../../resources/icon.png'
import { m } from '../paraglide/messages'
import type { UpdateState } from '../types'

const GITHUB_REPOSITORY_URL = 'https://github.com/tszones/MDXforge'

export function WindowTitleBar({
  inSettings,
  colorMode,
  opening,
  onBackToPreview,
  onOpenFile,
  onOpenFolder,
  onOpenSettings,
  onToggleColorMode
}: {
  inSettings: boolean
  colorMode: 'light' | 'dark'
  opening: boolean
  onBackToPreview: () => void
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenSettings: () => void
  onToggleColorMode: () => void
}): React.JSX.Element {
  const [maximized, setMaximized] = useState(false)
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle', version: '' })

  useEffect(() => {
    void window.api.isWindowMaximized().then(setMaximized)
    void window.api.getUpdateState().then(setUpdateState)
    return window.api.onUpdateState(setUpdateState)
  }, [])

  useEffect(() => {
    if (!fileMenuOpen) return
    const close = (): void => setFileMenuOpen(false)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', close)
    }
  }, [fileMenuOpen])

  async function toggleMaximize(): Promise<void> {
    setMaximized(await window.api.maximizeWindow())
  }

  async function handleUpdateClick(): Promise<void> {
    if (updateState.status === 'downloaded') {
      await window.api.quitAndInstallUpdate()
      return
    }

    setUpdateState(await window.api.checkForUpdates())
  }

  const updateBusy = updateState.status === 'checking' || updateState.status === 'downloading'
  const updateReady = updateState.status === 'downloaded'

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-10 select-none items-center border-b bg-fd-background/95 backdrop-blur supports-[backdrop-filter]:bg-fd-background/80 [-webkit-app-region:drag]">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 text-sm font-medium text-fd-muted-foreground">
        <img src={appIcon} alt="" className="size-4 shrink-0 rounded-sm" />
        <span className="truncate">MDXForge</span>
        <div className="relative ml-2 [-webkit-app-region:no-drag]">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setFileMenuOpen((open) => !open)
            }}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            aria-expanded={fileMenuOpen}
          >
            {m.title_bar_file_menu()}
            <ChevronDown className="size-3.5" />
          </button>
          {fileMenuOpen ? (
            <div className="absolute left-0 top-8 z-50 min-w-44 rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg">
              <FileMenuItem
                disabled={opening}
                onClick={() => {
                  setFileMenuOpen(false)
                  onOpenFile()
                }}
              >
                {opening ? m.actions_opening() : m.actions_open_mdx_file()}
              </FileMenuItem>
              <FileMenuItem
                disabled={opening}
                onClick={() => {
                  setFileMenuOpen(false)
                  onOpenFolder()
                }}
              >
                {m.actions_open_folder()}
              </FileMenuItem>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex h-full [-webkit-app-region:no-drag]">
        <TitleBarButton
          label={getUpdateButtonLabel(updateState)}
          active={updateReady}
          onClick={() => void handleUpdateClick()}
          disabled={updateBusy}
        >
          {updateReady ? (
            <Download className="size-4" />
          ) : (
            <RefreshCw className={`size-4 ${updateBusy ? 'animate-spin' : ''}`} />
          )}
        </TitleBarButton>
        <TitleBarButton
          label={m.title_bar_open_github()}
          onClick={() => window.open(GITHUB_REPOSITORY_URL, '_blank', 'noopener,noreferrer')}
        >
          <IconBrandGithub className="size-4" />
        </TitleBarButton>
        <TitleBarButton
          label={
            colorMode === 'dark' ? m.title_bar_switch_to_light() : m.title_bar_switch_to_dark()
          }
          onClick={onToggleColorMode}
        >
          {colorMode === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </TitleBarButton>
        <TitleBarButton
          label={inSettings ? m.title_bar_back_to_preview() : m.title_bar_settings()}
          onClick={inSettings ? onBackToPreview : onOpenSettings}
        >
          {inSettings ? <ArrowLeft className="size-4" /> : <Settings className="size-4" />}
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

function getUpdateButtonLabel(state: UpdateState): string {
  if (state.status === 'checking') return m.settings_updates_checking()
  if (state.status === 'downloading') {
    return m.settings_updates_downloading({ percent: state.percent ?? 0 })
  }
  if (state.status === 'downloaded') return m.settings_updates_restart()
  return m.settings_updates_check()
}

function FileMenuItem({
  disabled,
  onClick,
  children
}: {
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function TitleBarButton({
  label,
  danger,
  active,
  disabled,
  onClick,
  children
}: {
  label: string
  danger?: boolean
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-full w-11 items-center justify-center text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-60 data-[active=true]:text-fd-primary data-[danger=true]:hover:bg-red-500 data-[danger=true]:hover:text-white"
      data-danger={danger}
      data-active={active}
    >
      {children}
    </button>
  )
}
