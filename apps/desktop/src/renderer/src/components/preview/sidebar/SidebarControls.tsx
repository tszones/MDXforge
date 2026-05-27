import { X } from 'lucide-react'
import { m } from '../../../paraglide/messages'
import type { SidebarTab } from './useWorkspaceSidebarTabs'

export function SidebarTabs({
  activeTab,
  onActiveTabChange
}: {
  activeTab: SidebarTab
  onActiveTabChange: (tab: SidebarTab) => void
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 rounded-lg border bg-fd-secondary/50 p-1 text-xs font-medium text-fd-muted-foreground">
      <SidebarTabButton active={activeTab === 'files'} onClick={() => onActiveTabChange('files')}>
        {m.preview_tab_files()}
      </SidebarTabButton>
      <SidebarTabButton active={activeTab === 'search'} onClick={() => onActiveTabChange('search')}>
        {m.preview_tab_search()}
      </SidebarTabButton>
    </div>
  )
}

function SidebarTabButton({
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
      className={
        active
          ? 'rounded-md bg-fd-background px-2 py-1.5 text-fd-foreground shadow-sm'
          : 'rounded-md px-2 py-1.5 transition-colors hover:text-fd-foreground'
      }
    >
      {children}
    </button>
  )
}

export function SidebarFilterInput({
  activeTab,
  fileFilterInputRef,
  workspaceSearchInputRef,
  fileFilterQuery,
  searchQuery,
  onFileFilterQueryChange,
  onSearchQueryChange
}: {
  activeTab: SidebarTab
  fileFilterInputRef: React.RefObject<HTMLInputElement | null>
  workspaceSearchInputRef: React.RefObject<HTMLInputElement | null>
  fileFilterQuery: string
  searchQuery: string
  onFileFilterQueryChange: (query: string) => void
  onSearchQueryChange: (query: string) => void
}): React.JSX.Element {
  const currentQuery = activeTab === 'files' ? fileFilterQuery : searchQuery

  return (
    <>
      {activeTab === 'files' ? (
        <input
          ref={fileFilterInputRef}
          value={fileFilterQuery}
          onChange={(event) => onFileFilterQueryChange(event.target.value)}
          placeholder={m.preview_filter_files_placeholder()}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
        />
      ) : (
        <input
          ref={workspaceSearchInputRef}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={m.preview_search_workspace_placeholder()}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
        />
      )}
      {currentQuery ? (
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'files') onFileFilterQueryChange('')
            else onSearchQueryChange('')
          }}
          className="rounded p-0.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
          aria-label={m.preview_clear_search()}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </>
  )
}
