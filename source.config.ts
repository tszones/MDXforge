import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import {
  getDocuforgeRehypeCodeOptions,
  withDocuforgeRehypePlugins,
  withDocuforgeRemarkPlugins
} from './src/renderer/src/lib/mdx-options'

export const docs = defineDocs({
  dir: 'content/docs'
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: withDocuforgeRemarkPlugins,
    rehypePlugins: withDocuforgeRehypePlugins,
    rehypeCodeOptions: getDocuforgeRehypeCodeOptions()
  }
})
