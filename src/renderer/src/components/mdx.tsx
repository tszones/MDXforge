import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import type { ComponentType, ReactNode } from 'react'

function fallback(name: string): ComponentType<{ children?: ReactNode }> {
  return function FallbackComponent({ children }) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-fd-border bg-fd-muted/30 p-4 text-sm">
        <div className="mb-2 font-mono text-xs text-fd-muted-foreground">{`<${name}>`}</div>
        {children}
      </div>
    )
  }
}

const fallbackComponents = {
  Accordion: fallback('Accordion'),
  Accordions: fallback('Accordions'),
  Step: fallback('Step'),
  Steps: fallback('Steps'),
  File: fallback('File'),
  Files: fallback('Files'),
  Tabs: fallback('Tabs'),
  Tab: fallback('Tab'),
  UnknownComponent: fallback('UnknownComponent')
} as unknown as MDXComponents

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...fallbackComponents,
    ...components
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

export const allowedMdxComponents = Object.keys(getMDXComponents()).sort()

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
