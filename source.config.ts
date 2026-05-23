import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import {
  getMDXForgeRehypeCodeOptions,
  withMDXForgeRehypePlugins,
  withMDXForgeRemarkPlugins
} from './src/main/mdx-options'

export const docs = defineDocs({
  dir: 'content/docs'
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: withMDXForgeRemarkPlugins,
    rehypePlugins: withMDXForgeRehypePlugins,
    rehypeCodeOptions: getMDXForgeRehypeCodeOptions()
  }
})
