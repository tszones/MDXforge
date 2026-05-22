import fumadocsMdxComponents from 'fumadocs-ui/mdx'
import { type ComponentType, createElement, type ReactNode } from 'react'

const defaultMdxComponents = (
  'default' in fumadocsMdxComponents ? fumadocsMdxComponents.default : fumadocsMdxComponents
) as MdxComponents

type MdxComponent = ComponentType<any> | string
type MdxComponents = Record<string, MdxComponent>

function fallback(name: string): ComponentType<{ children?: ReactNode }> {
  return function FallbackComponent({ children }) {
    return createElement(
      'div',
      {
        className:
          'my-4 rounded-lg border border-dashed border-fd-border bg-fd-muted/30 p-4 text-sm'
      },
      createElement(
        'div',
        { className: 'mb-2 font-mono text-xs text-fd-muted-foreground' },
        `<${name}>`
      ),
      children
    )
  }
}

export const mdxComponents = {
  ...defaultMdxComponents,

  // Fumadocs aliases / explicit allowlist
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

  // tolerated placeholders until project-specific components exist
  Accordion: fallback('Accordion'),
  Accordions: fallback('Accordions'),
  Step: fallback('Step'),
  Steps: fallback('Steps'),
  File: fallback('File'),
  Files: fallback('Files'),
  Tabs: fallback('Tabs'),
  Tab: fallback('Tab')
} satisfies MdxComponents

export const allowedMdxComponents = Object.keys(mdxComponents).sort()
