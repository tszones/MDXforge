import type { TOCItemType } from 'fumadocs-core/toc'
import { TOCProvider, TOCScrollArea, useItems, useTOCItems } from 'fumadocs-ui/components/toc'
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import { Pin, Text } from 'lucide-react'
import { m } from '../../paraglide/messages'

export function DocumentTocRail({
  toc,
  pinned,
  onPinnedChange
}: {
  toc: TOCItemType[]
  pinned: boolean
  onPinnedChange: (pinned: boolean) => void
}): React.JSX.Element | null {
  if (toc.length === 0) return null

  return (
    <TOCProvider toc={toc}>
      {pinned ? (
        <PinnedToc onUnpin={() => onPinnedChange(false)} />
      ) : (
        <HoverToc onPin={() => onPinnedChange(true)} />
      )}
    </TOCProvider>
  )
}

function PinnedToc({ onUnpin }: { onUnpin: () => void }): React.JSX.Element {
  return (
    <aside className="hidden h-full min-h-0 w-64 flex-col bg-fd-background pt-12 pe-4 pb-2 ps-5 xl:flex">
      <div className="mb-3 flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        <Text className="size-4" />
        <span>{m.docs_toc()}</span>
        <button
          type="button"
          aria-label={m.docs_toc_unpin()}
          aria-pressed="true"
          title={m.docs_toc_unpin()}
          onClick={onUnpin}
          className="ms-auto inline-flex size-7 items-center justify-center rounded-md text-fd-primary transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <Pin className="size-3.5" />
        </button>
      </div>
      <TOCScrollArea>
        <TOCItems>
          <DocumentTocItems />
        </TOCItems>
      </TOCScrollArea>
    </aside>
  )
}

function HoverToc({ onPin }: { onPin: () => void }): React.JSX.Element {
  return (
    <aside className="group/toc pointer-events-none absolute inset-y-0 right-3 hidden w-64 xl:block">
      <MiniTocRail />
      <div className="pointer-events-auto absolute right-4 top-1/2 max-h-[min(576px,calc(100%-4rem))] w-56 -translate-y-1/2 rounded-xl border bg-fd-card/95 p-4 text-sm opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover/toc:opacity-100">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="font-medium text-fd-muted-foreground text-xs uppercase tracking-wide">
            {m.docs_toc()}
          </div>
          <button
            type="button"
            aria-label={m.docs_toc_pin()}
            aria-pressed="false"
            title={m.docs_toc_pin()}
            onClick={onPin}
            className="inline-flex size-7 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <Pin className="size-3.5" />
          </button>
        </div>
        <TOCScrollArea className="max-h-[min(500px,calc(100vh-8rem))]">
          <TOCItems>
            <DocumentTocItems />
          </TOCItems>
        </TOCScrollArea>
      </div>
    </aside>
  )
}

function MiniTocRail(): React.JSX.Element {
  const tocItems = useTOCItems()
  const activeItems = useItems()
  const activeUrls = new Set(
    activeItems
      .filter((item) => item.active || item.fallback)
      .map((item) => item.original.url)
  )

  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 flex max-h-[min(576px,calc(100%-4rem))] -translate-y-1/2 cursor-pointer flex-col items-end gap-3 overflow-hidden py-6 pe-1 opacity-100 transition-opacity duration-200 group-hover/toc:opacity-0">
      {tocItems.map((item) => (
        <a
          key={item.url}
          href={item.url}
          aria-label={String(item.title ?? '')}
          title={String(item.title ?? '')}
          data-active={activeUrls.has(item.url)}
          className={
            item.depth > 2
              ? 'h-[3px] w-2.5 shrink-0 rounded-full bg-fd-muted-foreground/25 transition-colors hover:bg-fd-primary/70 data-[active=true]:bg-fd-primary'
              : 'h-[3px] w-4 shrink-0 rounded-full bg-fd-muted-foreground/25 transition-colors hover:bg-fd-primary/70 data-[active=true]:bg-fd-primary'
          }
        />
      ))}
    </div>
  )
}

function DocumentTocItems(): React.JSX.Element {
  const items = useTOCItems()

  return (
    <>
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </>
  )
}
