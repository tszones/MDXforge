import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@mdxforge/ui/components/table'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { mdxforgeMdxComponents } from './mdx-components.js'

export * from './Mermaid.js'
export * from './MetricCard.js'
export * from './SimpleBarChart.js'
export * from './SimpleLineChart.js'
export * from './StatGrid.js'
export * from './Todo.js'
export { mdxforgeMdxComponents }

const markdownTableComponents = {
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tfoot: TableFooter,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  caption: TableCaption
} satisfies MDXComponents

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...markdownTableComponents,
    ...mdxforgeMdxComponents,
    ...components
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

export const allowedMdxComponents = Object.keys(getMDXComponents()).sort()

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
