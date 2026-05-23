import {
  type RehypeCodeOptions,
  rehypeCode,
  rehypeCodeDefaultOptions
} from 'fumadocs-core/mdx-plugins/rehype-code'
import { rehypeToc } from 'fumadocs-core/mdx-plugins/rehype-toc'
import { remarkHeading } from 'fumadocs-core/mdx-plugins/remark-heading'
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins/remark-mdx-mermaid'
import { transformerTwoslash } from 'fumadocs-twoslash'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { Pluggable } from 'unified'

export function getMDXForgeRehypeCodeOptions(): RehypeCodeOptions {
  return {
    ...rehypeCodeDefaultOptions,
    transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    langs: ['js', 'jsx', 'ts', 'tsx']
  }
}

export function getMDXForgeRemarkPlugins(): Pluggable[] {
  return [remarkMdxMermaid, remarkGfm, remarkMath, [remarkHeading, { generateToc: false }]]
}

export function getMDXForgeRehypePlugins(): Pluggable[] {
  return [rehypeKatex, [rehypeCode, getMDXForgeRehypeCodeOptions()], rehypeToc]
}

export function withMDXForgeRemarkPlugins(plugins: Pluggable[]): Pluggable[] {
  return [remarkMdxMermaid, remarkGfm, remarkMath, ...plugins]
}

export function withMDXForgeRehypePlugins(plugins: Pluggable[]): Pluggable[] {
  return [rehypeKatex, ...plugins]
}
