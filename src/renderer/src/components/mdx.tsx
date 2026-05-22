import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { docuforgeMdxComponents } from './mdx-components'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...docuforgeMdxComponents,
    ...components
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

export const allowedMdxComponents = Object.keys(getMDXComponents()).sort()

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
