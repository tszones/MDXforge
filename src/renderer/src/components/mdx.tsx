import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { mdxforgeMdxComponents } from './mdx-components'

const markdownTableComponents = {
  table: mdxforgeMdxComponents.Table,
  thead: mdxforgeMdxComponents.TableHeader,
  tbody: mdxforgeMdxComponents.TableBody,
  tfoot: mdxforgeMdxComponents.TableFooter,
  tr: mdxforgeMdxComponents.TableRow,
  th: mdxforgeMdxComponents.TableHead,
  td: mdxforgeMdxComponents.TableCell,
  caption: mdxforgeMdxComponents.TableCaption
} satisfies MDXComponents

export function getMDXComponents(components?: MDXComponents) {
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
