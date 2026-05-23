const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const runtime = require('react/jsx-runtime')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { LOCAL_IMAGE_SCHEME, remarkLocalImages } = jiti('../src/main/local-images.ts')
const { remarkWikiLinks } = jiti('../src/main/wiki-links.ts')

async function main() {
  const { compile } = await import('@mdx-js/mdx')
  const rehypeKatex = (await import('rehype-katex')).default
  const { rehypeCode, rehypeCodeDefaultOptions } = await import(
    'fumadocs-core/mdx-plugins/rehype-code'
  )
  const { remarkMdxMermaid } = await import('fumadocs-core/mdx-plugins/remark-mdx-mermaid')
  const { transformerTwoslash } = await import('fumadocs-twoslash')
  const remarkGfm = (await import('remark-gfm')).default
  const remarkMath = (await import('remark-math')).default
  const Twoslash = await import('fumadocs-twoslash/ui')
  const fumadocsMdxComponents = require('fumadocs-ui/mdx')
  const defaultMdxComponents =
    'default' in fumadocsMdxComponents ? fumadocsMdxComponents.default : fumadocsMdxComponents

  const { Accordion, Accordions } = await import('fumadocs-ui/components/accordion')
  const { Banner } = await import('fumadocs-ui/components/banner')
  const { DynamicCodeBlock } = await import('fumadocs-ui/components/dynamic-codeblock')
  const { File, Files, Folder } = await import('fumadocs-ui/components/files')
  const { GithubInfo } = await import('fumadocs-ui/components/github-info')
  const { Heading } = await import('fumadocs-ui/components/heading')
  const ImageZoom = (props) => React.createElement('img', props)
  const { InlineTOC } = await import('fumadocs-ui/components/inline-toc')
  const { Step, Steps } = await import('fumadocs-ui/components/steps')
  const { Tab, Tabs, TabsContent, TabsList, TabsTrigger } = await import(
    'fumadocs-ui/components/tabs'
  )
  const { TypeTable } = await import('fumadocs-ui/components/type-table')

  const components = {
    ...defaultMdxComponents,
    Callout: defaultMdxComponents.Callout,
    CalloutContainer: defaultMdxComponents.CalloutContainer,
    CalloutTitle: defaultMdxComponents.CalloutTitle,
    CalloutDescription: defaultMdxComponents.CalloutDescription,
    Cards: defaultMdxComponents.Cards,
    Card: defaultMdxComponents.Card,
    CodeBlockTabs: defaultMdxComponents.CodeBlockTabs,
    CodeBlockTab: defaultMdxComponents.CodeBlockTab,
    CodeBlockTabsList: defaultMdxComponents.CodeBlockTabsList,
    CodeBlockTabsTrigger: defaultMdxComponents.CodeBlockTabsTrigger,
    Accordion,
    Accordions,
    Banner,
    DynamicCodeBlock,
    File,
    Files,
    Folder,
    GithubInfo,
    Heading,
    ImageZoom,
    InlineTOC,
    Step,
    Steps,
    Tab,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    TypeTable,
    MetricCard({ label, value, description, trend, tone = 'default' }) {
      return React.createElement(
        'div',
        { 'data-mdxforge-metric-card': '', 'data-tone': tone },
        React.createElement('div', null, label),
        React.createElement('div', null, value),
        trend ? React.createElement('div', null, trend) : null,
        description ? React.createElement('p', null, description) : null
      )
    },
    StatGrid({ items = [], columns = 3 }) {
      return React.createElement(
        'div',
        { 'data-mdxforge-stat-grid': '', 'data-columns': columns },
        items.map((item, index) =>
          React.createElement(components.MetricCard, { ...item, key: `${item.label}-${index}` })
        )
      )
    },
    SimpleBarChart({ data = [], title, description, unit }) {
      return React.createElement(
        'figure',
        { 'data-mdxforge-simple-bar-chart': '', 'data-unit': unit ?? '' },
        title ? React.createElement('figcaption', null, title) : null,
        description ? React.createElement('p', null, description) : null,
        data.map((item, index) =>
          React.createElement(
            'div',
            { key: `${item.name}-${index}` },
            `${item.name}: ${item.value}`
          )
        )
      )
    },
    SimpleLineChart({ data = [], title, description, unit }) {
      return React.createElement(
        'figure',
        { 'data-mdxforge-simple-line-chart': '', 'data-unit': unit ?? '' },
        title ? React.createElement('figcaption', null, title) : null,
        description ? React.createElement('p', null, description) : null,
        data.map((item, index) =>
          React.createElement(
            'div',
            { key: `${item.name}-${index}` },
            `${item.name}: ${item.value}`
          )
        )
      )
    },
    TodoList({ title, description, children }) {
      return React.createElement(
        'section',
        { 'data-mdxforge-todo-list': '' },
        title ? React.createElement('h3', null, title) : null,
        description ? React.createElement('p', null, description) : null,
        React.createElement('ul', null, children)
      )
    },
    Todo({ checked, status, children }) {
      return React.createElement(
        'li',
        { 'data-mdxforge-todo': '', 'data-status': status ?? (checked ? 'done' : 'todo') },
        children
      )
    },
    ToDoList({ title, description, children }) {
      return components.TodoList({ title, description, children })
    },
    ToDo({ checked, status, children }) {
      return components.Todo({ checked, status, children })
    },
    Mermaid({ chart }) {
      return React.createElement('div', { 'data-mdxforge-mermaid': '' }, chart)
    },
    ...Twoslash,
    wrapper({ children }) {
      return React.createElement(React.Fragment, null, children)
    }
  }

  const dir = path.resolve(__dirname, '..', 'test-fixtures', 'mdx')
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .sort()
  let failed = 0

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const raw = fs.readFileSync(fullPath, 'utf8')
    const parsed = matter(raw)
    const expectError = parsed.data.expected === 'error' || file.startsWith('99-')
    const mustContain = typeof parsed.data.mustContain === 'string' ? parsed.data.mustContain : null

    try {
      const compiled = String(
        await compile(parsed.content, {
          outputFormat: 'function-body',
          development: false,
          remarkPlugins: [
            [
              remarkLocalImages,
              {
                documentPath: fullPath,
                workspaceRoot: dir
              }
            ],
            remarkWikiLinks,
            remarkMdxMermaid,
            remarkGfm,
            remarkMath
          ],
          rehypePlugins: [
            rehypeKatex,
            [
              rehypeCode,
              {
                ...rehypeCodeDefaultOptions,
                transformers: [
                  ...(rehypeCodeDefaultOptions.transformers ?? []),
                  transformerTwoslash()
                ],
                langs: ['js', 'jsx', 'ts', 'tsx']
              }
            ]
          ]
        })
      )
      const mod = new Function(String(compiled))(runtime)
      const html = renderToStaticMarkup(React.createElement(mod.default, { components }))

      if (expectError) {
        console.error(`FAIL ${file}: expected error but rendered ${html.length} chars`)
        failed++
      } else if (
        mustContain &&
        !html.includes(mustContain.replace('{LOCAL_IMAGE_SCHEME}', LOCAL_IMAGE_SCHEME))
      ) {
        console.error(`FAIL ${file}: rendered output does not contain ${mustContain}`)
        failed++
      } else {
        console.log(`PASS ${file}: ${html.length} chars`)
      }
    } catch (error) {
      if (expectError) {
        console.log(`PASS ${file}: expected error: ${error.message}`)
      } else {
        console.error(`FAIL ${file}: ${error.stack || error.message}`)
        failed++
      }
    }
  }

  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
