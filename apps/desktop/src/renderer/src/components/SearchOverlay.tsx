import { useHotkeys } from '@tanstack/react-hotkeys'
import { FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { appHotkeys } from '../lib/hotkeys'
import { filterFileEntries, getTextMatches } from '../lib/search-model'
import { m } from '../paraglide/messages'
import type { MdxFolderEntry, MdxWorkspace } from '../types'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'

type SearchMode = 'file' | 'quickOpen'

interface SearchOverlayProps {
  workspace: MdxWorkspace | null
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}

export function SearchOverlay({ workspace, onOpenPath }: SearchOverlayProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<SearchMode>('file')
  const [query, setQuery] = useState('')

  function openMode(nextMode: SearchMode): void {
    setMode(nextMode)
    setQuery('')
    setOpen(true)
  }

  useHotkeys(
    [
      {
        hotkey: appHotkeys.findInFile,
        callback: () => openMode('file'),
        options: {
          enabled: Boolean(workspace),
          meta: {
            name: 'Find in file',
            description: 'Search inside the current document.'
          }
        }
      },
      {
        hotkey: appHotkeys.quickOpenFile,
        callback: () => openMode('quickOpen'),
        options: {
          enabled: Boolean(workspace?.folder),
          meta: {
            name: 'Quick open file',
            description: 'Open a document by file name or title.'
          }
        }
      }
    ],
    { ignoreInputs: true }
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={getModeTitle(mode)}
      description={getModeDescription(mode)}
      className="top-24 w-[min(760px,calc(100vw-2rem))] max-w-none translate-y-0"
    >
      <Command shouldFilter={false}>
        <div className="flex items-center gap-1 border-b p-1">
          <ModeButton active={mode === 'file'} onClick={() => openMode('file')}>
            {m.search_mode_file()}
          </ModeButton>
          <ModeButton
            active={mode === 'quickOpen'}
            disabled={!workspace?.folder}
            onClick={() => openMode('quickOpen')}
          >
            {m.search_mode_quick_open()}
          </ModeButton>
        </div>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={getModePlaceholder(mode)}
        />
        <SearchResults
          mode={mode}
          query={query}
          workspace={workspace}
          onOpenPath={(filePath, workspaceRoot) => {
            setOpen(false)
            onOpenPath(filePath, workspaceRoot)
          }}
        />
      </Command>
    </CommandDialog>
  )
}

function SearchResults({
  mode,
  query,
  workspace,
  onOpenPath
}: {
  mode: SearchMode
  query: string
  workspace: MdxWorkspace | null
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}): React.JSX.Element {
  if (!workspace) {
    return <EmptyState>{m.search_empty_no_file()}</EmptyState>
  }

  if (mode === 'quickOpen') {
    return (
      <QuickOpenResults
        query={query}
        entries={workspace.folder?.files ?? []}
        activePath={workspace.file.path}
        workspaceRoot={workspace.folder?.rootPath}
        onOpenPath={onOpenPath}
      />
    )
  }

  return <FileSearchResults query={query} workspace={workspace} />
}

function FileSearchResults({
  query,
  workspace
}: {
  query: string
  workspace: MdxWorkspace
}): React.JSX.Element {
  const matches = useMemo(
    () => getTextMatches(workspace.file.raw, query, { maxMatches: 100, contextChars: 80 }),
    [workspace.file.raw, query]
  )

  if (!query.trim()) return <EmptyState>{m.search_empty_type_query()}</EmptyState>
  if (matches.length === 0) return <EmptyState>{m.search_empty_no_results()}</EmptyState>

  return (
    <CommandList className="max-h-[min(60vh,520px)]">
      {matches.map((match) => (
        <CommandItem
          key={`${match.line}:${match.column}:${match.preview}`}
          value={`${match.line}:${match.column}:${match.preview}`}
          onSelect={() => findRenderedText(query)}
        >
          <Search className="size-4 text-fd-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-fd-muted-foreground">
              {m.search_line_column({ line: match.line, column: match.column })}
            </div>
            <div className="truncate text-sm">{match.preview}</div>
          </div>
        </CommandItem>
      ))}
    </CommandList>
  )
}

function findRenderedText(query: string): void {
  const find = (
    window as Window & {
      find?: (
        query: string,
        caseSensitive?: boolean,
        backwards?: boolean,
        wrapAround?: boolean
      ) => boolean
    }
  ).find

  find?.(query, false, false, true)
}

function QuickOpenResults({
  query,
  entries,
  activePath,
  workspaceRoot,
  onOpenPath
}: {
  query: string
  entries: MdxFolderEntry[]
  activePath: string
  workspaceRoot?: string
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}): React.JSX.Element {
  const results = useMemo(
    () => (query.trim() ? filterFileEntries(entries, query) : entries.slice(0, 80)),
    [entries, query]
  )

  if (entries.length === 0) return <EmptyState>{m.search_empty_no_workspace()}</EmptyState>
  if (results.length === 0) return <EmptyState>{m.search_empty_no_results()}</EmptyState>

  return (
    <CommandList className="max-h-[min(60vh,520px)]">
      {results.map((entry) => (
        <CommandItem
          key={entry.path}
          value={`${entry.title ?? ''} ${entry.relativePath}`}
          onSelect={() => onOpenPath(entry.path, workspaceRoot)}
        >
          <FileText className="size-4 text-fd-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {entry.title ?? entry.displayPath ?? entry.name}
            </div>
            <div className="truncate text-xs text-fd-muted-foreground">{entry.relativePath}</div>
          </div>
          {entry.path === activePath ? (
            <span className="text-xs text-fd-primary">{m.search_current_file()}</span>
          ) : null}
        </CommandItem>
      ))}
    </CommandList>
  )
}

function ModeButton({
  active,
  disabled,
  onClick,
  children
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-active={active}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:cursor-not-allowed disabled:opacity-40 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
    >
      {children}
    </button>
  )
}

function EmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <CommandEmpty className="text-fd-muted-foreground">{children}</CommandEmpty>
}

function getModeTitle(mode: SearchMode): string {
  if (mode === 'quickOpen') return m.search_mode_quick_open()
  return m.search_mode_file()
}

function getModeDescription(mode: SearchMode): string {
  if (mode === 'quickOpen') return m.search_quick_open_description()
  return m.search_file_description()
}

function getModePlaceholder(mode: SearchMode): string {
  if (mode === 'quickOpen') return m.search_quick_open_placeholder()
  return m.search_file_placeholder()
}
