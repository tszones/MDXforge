import type { TOCItemType } from 'fumadocs-core/toc'
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc'
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import { m } from '../../paraglide/messages'

export function DocumentTocRail({ toc }: { toc: TOCItemType[] }): React.JSX.Element | null {
  if (toc.length === 0) return null

  return (
    <aside className="group/toc pointer-events-none absolute inset-y-0 right-3 hidden w-64 xl:block">
      <TOCProvider toc={toc}>
        <MiniTocRail />
        <div className="pointer-events-auto absolute right-4 top-1/2 max-h-[min(576px,calc(100%-4rem))] w-56 -translate-y-1/2 rounded-xl border bg-fd-card/95 p-4 text-sm opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover/toc:opacity-100">
          <div className="mb-3 font-medium text-fd-muted-foreground text-xs uppercase tracking-wide">
            {m.docs_toc()}
          </div>
          <TOCScrollArea className="max-h-[min(500px,calc(100vh-8rem))]">
            <TOCItems>
              <DocumentTocItems />
            </TOCItems>
          </TOCScrollArea>
        </div>
      </TOCProvider>
    </aside>
  )
}

function MiniTocRail(): React.JSX.Element {
  const items = useTOCItems()

  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 flex max-h-[min(576px,calc(100%-4rem))] -translate-y-1/2 cursor-pointer flex-col items-end gap-3 overflow-hidden py-6 pe-1 opacity-100 transition-opacity duration-200 group-hover/toc:opacity-0">
      {items.map((item) => (
        <a
          key={item.url}
          href={item.url}
          aria-label={String(item.title ?? '')}
          title={String(item.title ?? '')}
          data-active={item.url === window.location.hash}
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
