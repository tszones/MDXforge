import type { TOCItemType } from 'fumadocs-core/toc'
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc'
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import { ChevronDown, PanelLeft, Text } from 'lucide-react'
import type { ReactNode } from 'react'

interface MdxDocsLayoutProps {
  toc: TOCItemType[]
  sidebar: ReactNode
  children: ReactNode
}

export function MdxDocsLayout({ toc, sidebar, children }: MdxDocsLayoutProps): React.JSX.Element {
  return (
    <TOCProvider toc={toc}>
      <div
        id="nd-docs-layout"
        className="grid min-h-(--fd-docs-height) overflow-x-clip [--fd-docs-height:100dvh] [--fd-docs-row-1:0px] [--fd-docs-row-2:0px] [--fd-layout-width:97rem] [--fd-sidebar-col:var(--fd-sidebar-width)] [--fd-sidebar-width:0px] [--fd-toc-popover-height:0px] [--fd-toc-width:0px] md:[--fd-sidebar-width:268px] xl:[--fd-toc-width:268px]"
        style={{
          gridTemplate: `"sidebar sidebar header toc toc"
"sidebar sidebar toc-popover toc toc"
"sidebar sidebar main toc toc" 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width) - var(--fd-sidebar-width) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`
        }}
      >
        {sidebar}
        {toc.length > 0 ? <MdxTocPopover /> : null}
        {children}
        {toc.length > 0 ? <MdxToc /> : null}
      </div>
    </TOCProvider>
  )
}

export function MdxPageContainer({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <article
      id="nd-page"
      className="flex w-full max-w-[900px] flex-col gap-4 px-4 py-6 md:px-6 md:pt-8 xl:px-8 xl:pt-14 [grid-area:main] mx-auto"
    >
      {children}
    </article>
  )
}

function MdxToc(): React.JSX.Element {
  return (
    <div
      id="nd-toc"
      className="sticky top-(--fd-docs-row-1) hidden h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) flex-col pt-12 pe-4 pb-2 [grid-area:toc] xl:flex"
    >
      <h3
        id="toc-title"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground"
      >
        <Text className="size-4" />
        目录
      </h3>
      <TOCScrollArea>
        <TOCItems>
          <TocItems />
        </TOCItems>
      </TOCScrollArea>
    </div>
  )
}

function MdxTocPopover(): React.JSX.Element {
  return (
    <div className="sticky top-(--fd-docs-row-2) z-10 h-(--fd-toc-popover-height) [grid-area:toc-popover] xl:hidden max-xl:[--fd-toc-popover-height:--spacing(10)]">
      <header className="border-b bg-fd-background/80 backdrop-blur-sm">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm text-fd-muted-foreground focus-visible:outline-none md:px-6 [&_svg]:size-4"
        >
          <PanelLeft className="shrink-0" />
          <span className="truncate">目录</span>
          <ChevronDown className="ms-auto shrink-0" />
        </button>
      </header>
    </div>
  )
}

function TocItems(): React.JSX.Element {
  const items = useTOCItems()

  return (
    <>
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </>
  )
}
