import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@mdxforge/ui/components/command'
import { useHotkeys } from '@tanstack/react-hotkeys'
import { FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { appHotkeys } from '../lib/hotkeys'
import { filterFileEntries } from '../lib/search-model'
import { m } from '../paraglide/messages'
import type { MdxFolderEntry, MdxWorkspace } from '../types'

interface SearchOverlayProps {
  workspace: MdxWorkspace | null
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}

export function SearchOverlay({ workspace, onOpenPath }: SearchOverlayProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  function openQuickOpen(): void {
    setQuery('')
    setOpen(true)
  }

  useHotkeys(
    [
      {
        hotkey: appHotkeys.quickOpenFile,
        callback: openQuickOpen,
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
      title={m.search_mode_quick_open()}
      description={m.search_quick_open_description()}
      className="top-24 w-[min(760px,calc(100vw-2rem))] max-w-none translate-y-0"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={m.search_quick_open_placeholder()}
        />
        <QuickOpenResults
          query={query}
          entries={workspace?.folder?.files ?? []}
          activePath={workspace?.file.path}
          workspaceRoot={workspace?.folder?.rootPath}
          onOpenPath={(filePath, workspaceRoot) => {
            setOpen(false)
            onOpenPath(filePath, workspaceRoot)
          }}
        />
      </Command>
    </CommandDialog>
  )
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
  activePath?: string
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

function EmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <CommandEmpty className="text-fd-muted-foreground">{children}</CommandEmpty>
}
