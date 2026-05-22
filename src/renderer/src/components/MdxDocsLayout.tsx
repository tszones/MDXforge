import type { TOCItemType } from 'fumadocs-core/toc'
import {
  SidebarCollapseTrigger as BaseSidebarCollapseTrigger,
  SidebarContent as BaseSidebarContent,
  SidebarProvider,
  useSidebar
} from 'fumadocs-ui/components/sidebar/base'
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc'
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import { ChevronDown, PanelLeft, SidebarIcon, Text } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { m } from '../paraglide/messages'

interface MdxDocsLayoutProps {
  toc: TOCItemType[]
  sidebar: ReactNode | ((state: { collapseSidebar: () => void }) => ReactNode)
  children: ReactNode
}

export function MdxDocsLayout(props: MdxDocsLayoutProps): React.JSX.Element {
  return (
    <SidebarProvider defaultOpenLevel={1}>
      <MdxDocsLayoutInner {...props} />
    </SidebarProvider>
  )
}

function MdxDocsLayoutInner({ toc, sidebar, children }: MdxDocsLayoutProps): React.JSX.Element {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <TOCProvider toc={toc}>
      <div
        id="nd-docs-layout"
        data-sidebar-collapsed={collapsed}
        className="grid min-h-0 flex-1 overflow-x-clip overflow-y-hidden [--fd-docs-height:calc(100dvh-40px)] [--fd-docs-row-1:0px] [--fd-docs-row-2:0px] [--fd-docs-row-3:var(--fd-toc-popover-height)] [--fd-layout-width:97rem] [--fd-sidebar-width:0px] [--fd-toc-popover-height:0px] [--fd-toc-width:0px] md:[--fd-sidebar-width:268px] xl:[--fd-toc-width:268px] data-[column-changed=true]:transition-[grid-template-columns]"
        style={
          {
            gridTemplate: `"sidebar sidebar header toc toc"
"sidebar sidebar toc-popover toc toc"
"sidebar sidebar main toc toc" 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width) - var(--fd-sidebar-width) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`,
            '--fd-sidebar-col': collapsed ? '0px' : 'var(--fd-sidebar-width)'
          } as CSSProperties
        }
      >
        <MdxSidebarSlot>
          {typeof sidebar === 'function'
            ? sidebar({ collapseSidebar: () => setCollapsed(true) })
            : sidebar}
        </MdxSidebarSlot>
        {toc.length > 0 ? <MdxTocPopover /> : null}
        {children}
        {toc.length > 0 ? <MdxToc /> : null}
      </div>
    </TOCProvider>
  )
}

function MdxSidebarSlot({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <BaseSidebarContent>
      {({ collapsed, hovered, ref, ...events }) => (
        <>
          <div className="pointer-events-none sticky top-(--fd-docs-row-1) z-20 hidden h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] *:pointer-events-auto [grid-area:sidebar] md:block">
            {collapsed ? <div className="absolute inset-y-0 inset-s-0 w-4" {...events} /> : null}
            <aside
              id="nd-sidebar"
              ref={ref}
              data-collapsed={collapsed}
              data-hovered={collapsed && hovered}
              className="absolute inset-y-0 inset-s-0 flex w-full flex-col items-end border-e bg-fd-card text-sm duration-250 *:w-(--fd-sidebar-width) data-[collapsed=true]:inset-y-2 data-[collapsed=true]:w-(--fd-sidebar-width) data-[collapsed=true]:rounded-xl data-[collapsed=true]:border data-[collapsed=true]:transition-transform data-[collapsed=true]:-translate-x-(--fd-sidebar-width) data-[hovered=true]:translate-x-2 data-[hovered=true]:shadow-lg rtl:data-[collapsed=true]:translate-x-full rtl:data-[hovered=true]:-translate-x-2"
              {...events}
            >
              {children}
            </aside>
          </div>
          <div
            className="fixed top-[calc(var(--fd-docs-row-3)+56px)] left-4 z-50 hidden rounded-xl border bg-fd-muted p-0.5 text-fd-muted-foreground shadow-lg transition-opacity data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0 md:flex"
            data-hidden={!collapsed || hovered}
          >
            <BaseSidebarCollapseTrigger className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground">
              <SidebarIcon className="size-4" />
            </BaseSidebarCollapseTrigger>
          </div>
        </>
      )}
    </BaseSidebarContent>
  )
}

export function MdxPageContainer({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <article
      id="nd-page"
      className="mx-auto flex min-h-0 w-full max-w-[900px] flex-col gap-4 overflow-auto px-4 py-6 md:px-6 md:pt-8 xl:px-8 xl:pt-14 [grid-area:main]"
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
        {m.docs_toc()}
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
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-(--fd-docs-row-2) z-30 h-(--fd-toc-popover-height) [grid-area:toc-popover] xl:hidden max-xl:[--fd-toc-popover-height:--spacing(10)]">
      <header className="border-b bg-fd-background/95 backdrop-blur-sm">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm text-fd-muted-foreground focus-visible:outline-none md:px-6 [&_svg]:size-4"
        >
          <PanelLeft className="shrink-0" />
          <span className="truncate">{m.docs_toc()}</span>
          <ChevronDown
            className="ms-auto shrink-0 transition-transform data-[open=true]:rotate-180"
            data-open={open}
          />
        </button>
      </header>
      {open ? (
        <div className="absolute inset-x-0 top-10 max-h-[min(60vh,420px)] overflow-auto border-b bg-fd-background/98 p-4 shadow-lg backdrop-blur-sm">
          <TOCScrollArea>
            <TOCItems>
              <TocItems />
            </TOCItems>
          </TOCScrollArea>
        </div>
      ) : null}
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
