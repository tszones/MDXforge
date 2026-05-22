import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { useEffect, useState } from 'react'

type MermaidRenderState =
  | { status: 'loading' }
  | { status: 'rendered'; svg: string; bindFunctions?: (element: Element) => void }
  | { status: 'error'; message: string }

export function Mermaid({ chart }: { chart: string }): React.JSX.Element {
  const theme = getMermaidTheme()
  const [state, setState] = useState<MermaidRenderState>({ status: 'loading' })

  useEffect(() => {
    let canceled = false

    async function renderChart(): Promise<void> {
      setState({ status: 'loading' })

      try {
        const { default: mermaid } = await import('mermaid')

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          themeCSS: 'margin: 1.5rem auto 0;',
          theme
        })

        const { svg, bindFunctions } = await mermaid.render(
          createMermaidId(),
          normalizeChart(chart)
        )

        if (!canceled) {
          setState({
            status: 'rendered',
            svg,
            bindFunctions:
              typeof bindFunctions === 'function'
                ? (element: Element) => bindFunctions(element as HTMLElement)
                : undefined
          })
        }
      } catch (cause) {
        if (!canceled) {
          setState({
            status: 'error',
            message: cause instanceof Error ? cause.message : String(cause)
          })
        }
      }
    }

    void renderChart()

    return () => {
      canceled = true
    }
  }, [chart, theme])

  if (state.status === 'error') {
    return (
      <div data-docuforge-mermaid="">
        <CodeBlock title="Mermaid">
          <Pre>{chart}</Pre>
        </CodeBlock>
        <p className="mt-2 text-sm text-fd-muted-foreground">{state.message}</p>
      </div>
    )
  }

  if (state.status === 'loading') {
    return <div data-docuforge-mermaid="" className="docuforge-mermaid" aria-busy="true" />
  }

  return (
    <div
      data-docuforge-mermaid=""
      className="docuforge-mermaid"
      ref={(container) => {
        if (container) state.bindFunctions?.(container)
      }}
      dangerouslySetInnerHTML={{ __html: state.svg }}
    />
  )
}

function getMermaidTheme(): 'default' | 'dark' {
  if (typeof document === 'undefined') return 'default'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'default'
}

function normalizeChart(chart: string): string {
  return chart.replaceAll('\\n', '\n').trim()
}

function createMermaidId(): string {
  const randomValue =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `docuforge-mermaid-${randomValue}`
}
