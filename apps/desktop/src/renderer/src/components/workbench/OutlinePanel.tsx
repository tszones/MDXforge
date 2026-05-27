import type { TOCItemType } from 'fumadocs-core/toc'
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc'
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import { m } from '../../paraglide/messages'

export function OutlinePanel({ toc }: { toc: TOCItemType[] }): React.JSX.Element {
  if (toc.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-fd-muted-foreground text-sm">
        {m.workbench_outline_empty()}
      </div>
    )
  }

  return (
    <TOCProvider toc={toc}>
      <TOCScrollArea>
        <TOCItems>
          <WorkbenchTocItems />
        </TOCItems>
      </TOCScrollArea>
    </TOCProvider>
  )
}

function WorkbenchTocItems(): React.JSX.Element {
  const items = useTOCItems()

  return (
    <>
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </>
  )
}
