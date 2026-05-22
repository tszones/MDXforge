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
import remarkMath from 'remark-math'
import type { Pluggable } from 'unified'

export function getDocuforgeRehypeCodeOptions(): RehypeCodeOptions {
  return {
    ...rehypeCodeDefaultOptions,
    transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    langs: ['js', 'jsx', 'ts', 'tsx']
  }
}

export function getDocuforgeRemarkPlugins(): Pluggable[] {
  return [remarkMdxMermaid, remarkMath, [remarkHeading, { generateToc: false }]]
}

export function getDocuforgeRehypePlugins(): Pluggable[] {
  return [rehypeKatex, [rehypeCode, getDocuforgeRehypeCodeOptions()], rehypeToc]
}

export function withDocuforgeRemarkPlugins(plugins: Pluggable[]): Pluggable[] {
  return [remarkMdxMermaid, remarkMath, ...plugins]
}

export function withDocuforgeRehypePlugins(plugins: Pluggable[]): Pluggable[] {
  return [rehypeKatex, ...plugins]
}
