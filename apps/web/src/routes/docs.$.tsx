import { createFileRoute } from '@tanstack/react-router'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { getMDXComponents } from '@/components/docs/mdx-components'
import { Logo } from '@/components/shared/logo'
import { SITE_URL } from '@/config/seo'
import { source } from '@/lib/source'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/docs/$')({
  head: () => ({
    meta: [
      { title: `${m.nav_docs()} · ${m.site_title()}` },
      {
        name: 'description',
        content: m.site_description()
      },
      {
        property: 'og:title',
        content: `${m.nav_docs()} · ${m.site_title()}`
      },
      {
        property: 'og:description',
        content: m.site_description()
      },
      {
        property: 'og:url',
        content: `${SITE_URL}/docs`
      }
    ]
  }),
  component: DocsRoute
})

function DocsRoute() {
  const params = Route.useParams()
  const slugs = params._splat ? params._splat.split('/').filter(Boolean) : undefined
  const page = source.getPage(slugs) ?? source.getPage([])

  if (!page) return <DocsNotFound />

  const MDX = page.data.body

  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: <Logo />,
        url: '/',
        transparentMode: 'none'
      }}
      searchToggle={{ enabled: false }}
      themeSwitch={{ enabled: false }}
    >
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  )
}

function DocsNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Document not found</h1>
      <p className="mt-4 text-muted-foreground">This documentation page does not exist.</p>
    </main>
  )
}
