import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { useFumadocsLoader } from 'fumadocs-core/source/client'
import { useMDXComponents } from './components/mdx'
import { baseOptions } from './lib/layout.shared'
import { source } from './lib/source'

const pageTree = source.getPageTree()

function DocsRoute(): React.JSX.Element {
  const slug = window.location.hash.replace(/^#\/?docs\/?/, '')
  const slugs = slug.split('/').filter(Boolean)
  const page = source.getPage(slugs) ?? source.getPage([])

  if (!page) {
    return <div>Not found</div>
  }

  const { pageTree: tree } = useFumadocsLoader({
    pageTree
  })

  const Mdx = page.data.body

  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      <DocsPage toc={page.data.toc}>
        <title>{page.data.title}</title>
        <meta name="description" content={page.data.description} />
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <Mdx components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  )
}

export default DocsRoute
