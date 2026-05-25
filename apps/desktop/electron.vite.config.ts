import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import mdx from 'fumadocs-mdx/vite'
import { resolve } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

const pathShim = resolve('src/renderer/src/lib/path-browser.ts')

export default defineConfig({
  main: {
    build: {
      externalizeDeps: {
        exclude: [
          '@mdxforge/mdx',
          '@mdx-js/mdx',
          'fumadocs-core',
          'fumadocs-twoslash',
          'rehype-katex',
          'remark-gfm',
          'remark-math'
        ]
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        path: pathShim,
        'node:path': pathShim,
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [
      {
        name: 'renderer-node-path-shim',
        enforce: 'pre',
        resolveId(id) {
          if (id === 'node:path' || id === 'path') return pathShim
          return null
        }
      },
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/renderer/src/paraglide',
        strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
        emitTsDeclarations: true,
        outputStructure: 'locale-modules'
      }),
      tsconfigPaths(),
      mdx(),
      tailwindcss(),
      react()
    ]
  }
})
