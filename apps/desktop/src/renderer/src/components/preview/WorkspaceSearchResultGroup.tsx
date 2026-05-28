import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { MdxWorkspaceSearchResult } from '../../types'

export function WorkspaceSearchResultGroup({
  result,
  active,
  collapsed,
  onToggle,
  onOpenPath,
  onOpenContextMenu
}: {
  result: MdxWorkspaceSearchResult
  active: boolean
  collapsed: boolean
  onToggle: () => void
  onOpenPath: (filePath: string, options?: { newTab?: boolean }) => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg text-fd-muted-foreground data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
      data-active={active}
    >
      <button
        type="button"
        title={result.relativePath}
        onClick={onToggle}
        onContextMenu={(event) => onOpenContextMenu(event, result.path)}
        className="flex w-full items-center gap-2 rounded-lg p-2 text-start transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
      >
        {collapsed ? (
          <ChevronRight className="size-3.5 shrink-0" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0" />
        )}
        <FileText className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {result.title ?? result.displayPath ?? result.name}
        </span>
        <span className="shrink-0 rounded-full bg-fd-secondary px-1.5 py-0.5 text-[0.6875rem] leading-none text-fd-muted-foreground">
          {result.matches.length}
        </span>
      </button>
      {collapsed ? null : (
        <div className="ms-7 flex flex-col gap-0.5 border-s border-fd-border ps-2 pb-1">
          {result.matches.map((match) => (
            <WorkspaceSearchMatchItem
              key={`${result.path}:${match.line}:${match.column}:${match.preview}`}
              result={result}
              match={match}
              onOpenPath={onOpenPath}
              onOpenContextMenu={onOpenContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WorkspaceSearchMatchItem({
  result,
  match,
  onOpenPath,
  onOpenContextMenu
}: {
  result: MdxWorkspaceSearchResult
  match: MdxWorkspaceSearchResult['matches'][number]
  onOpenPath: (filePath: string, options?: { newTab?: boolean }) => void
  onOpenContextMenu: (event: React.MouseEvent, path: string) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={`${result.relativePath}:${match.line}:${match.column}`}
      onClick={(event) => onOpenPath(result.path, { newTab: event.ctrlKey || event.metaKey })}
      onContextMenu={(event) => onOpenContextMenu(event, result.path)}
      className="flex w-full flex-col rounded-md px-2 py-1.5 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
    >
      <span className="truncate text-xs opacity-80">
        {m.search_line_column({ line: match.line, column: match.column })}
      </span>
      <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-fd-foreground/80">
        {match.preview}
      </span>
    </button>
  )
}
