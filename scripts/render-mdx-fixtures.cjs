const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const matter = require('gray-matter')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const runtime = require('react/jsx-runtime')

async function main() {
  const { compile } = await import('@mdx-js/mdx')
  const fumadocsMdxComponents = require('fumadocs-ui/mdx')
  const defaultMdxComponents =
    'default' in fumadocsMdxComponents ? fumadocsMdxComponents.default : fumadocsMdxComponents

  function fallback(name) {
    return function FallbackComponent({ children }) {
      return React.createElement(
        'div',
        { className: 'fallback' },
        React.createElement('div', null, `<${name}>`),
        children
      )
    }
  }

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
    Accordion: fallback('Accordion'),
    Accordions: fallback('Accordions'),
    Step: fallback('Step'),
    Steps: fallback('Steps'),
    File: fallback('File'),
    Files: fallback('Files'),
    Tabs: fallback('Tabs'),
    Tab: fallback('Tab'),
    wrapper({ children }) {
      return React.createElement(React.Fragment, null, children)
    }
  }

  const dir = path.resolve(__dirname, '..', 'test-fixtures', 'mdx')
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.mdx')).sort()
  let failed = 0

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const raw = fs.readFileSync(fullPath, 'utf8')
    const parsed = matter(raw)
    const expectError = parsed.data.expected === 'error' || file.startsWith('99-')

    try {
      const compiled = String(
        await compile(parsed.content, {
          outputFormat: 'function-body',
          development: false
        })
      )
      const mod = new Function(String(compiled))(runtime)
      const html = renderToStaticMarkup(React.createElement(mod.default, { components }))

      if (expectError) {
        console.error(`FAIL ${file}: expected error but rendered ${html.length} chars`)
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
