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
import { useEffect, useMemo, useState } from 'react'
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
  const entries = workspace?.folder?.files ?? []
  const results = useMemo(
    () => (query.trim() ? filterFileEntries(entries, query) : entries.slice(0, 80)),
    [entries, query]
  )
  const [selectedValue, setSelectedValue] = useState('')

  useEffect(() => {
    setSelectedValue(results[0]?.path ?? '')
  }, [results])

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
      className="top-20 w-[min(900px,calc(100vw-2rem))] max-w-none translate-y-0 sm:max-w-none"
    >
      <Command
        shouldFilter={false}
        loop
        value={selectedValue}
        className="mdxforge-quick-open"
        onValueChange={setSelectedValue}
      >
        <div className="border-b px-4 py-3">
          <div className="text-sm font-medium">{m.search_mode_quick_open()}</div>
          <div className="mt-0.5 text-xs text-fd-muted-foreground">
            {m.search_quick_open_description()}
          </div>
        </div>
        <div className="px-3 py-2">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={m.search_quick_open_placeholder()}
            wrapperClassName="p-0"
            inputGroupClassName="bg-transparent"
            autoFocus
          />
        </div>
        <QuickOpenResults
          results={results}
          hasEntries={entries.length > 0}
          activePath={workspace?.file.path}
          workspaceRoot={workspace?.folder?.rootPath}
          onOpenPath={(filePath, workspaceRoot) => {
            setOpen(false)
            onOpenPath(filePath, workspaceRoot)
          }}
        />
        <div className="flex items-center gap-3 border-t px-4 py-2 text-xs text-fd-muted-foreground">
          <KeyboardHint keys="↑↓" label={m.search_keyboard_navigate()} />
          <KeyboardHint keys="Enter" label={m.search_keyboard_open()} />
          <KeyboardHint keys="Esc" label={m.search_keyboard_close()} />
        </div>
      </Command>
    </CommandDialog>
  )
}

function QuickOpenResults({
  results,
  hasEntries,
  activePath,
  workspaceRoot,
  onOpenPath
}: {
  results: MdxFolderEntry[]
  hasEntries: boolean
  activePath?: string
  workspaceRoot?: string
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}): React.JSX.Element {
  if (!hasEntries) return <EmptyState>{m.search_empty_no_workspace()}</EmptyState>
  if (results.length === 0) return <EmptyState>{m.search_empty_no_results()}</EmptyState>

  return (
    <CommandList className="max-h-[min(60vh,520px)] px-3 pb-2 [&_[cmdk-list-sizer]]:space-y-1">
      {results.map((entry) => (
        <CommandItem
          key={entry.path}
          value={entry.path}
          keywords={[entry.title ?? '', entry.relativePath, entry.displayPath ?? '', entry.name]}
          onSelect={() => onOpenPath(entry.path, workspaceRoot)}
          className="py-2 data-[selected=false]:bg-transparent [&_svg]:text-fd-muted-foreground"
        >
          <FileText className="size-4 text-fd-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {entry.title ?? entry.displayPath ?? entry.name}
            </div>
            <div className="mdxforge-quick-open-path truncate text-xs text-fd-muted-foreground">{entry.relativePath}</div>
          </div>
          {entry.path === activePath ? (
            <span className="mdxforge-quick-open-current rounded-full bg-fd-primary/10 px-1.5 py-0.5 text-xs text-fd-primary">{m.search_current_file()}</span>
          ) : null}
        </CommandItem>
      ))}
    </CommandList>
  )
}

function KeyboardHint({ keys, label }: { keys: string; label: string }): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="rounded border bg-fd-secondary px-1.5 py-0.5 font-mono text-[0.6875rem] text-fd-foreground">
        {keys}
      </kbd>
      {label}
    </span>
  )
}

function EmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <CommandEmpty className="text-fd-muted-foreground">{children}</CommandEmpty>
}
