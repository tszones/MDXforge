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
      rollupOptions: {
        external: ['react', 'react-dom/server', 'react/jsx-runtime', 'fumadocs-ui/mdx']
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
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
      tsconfigPaths(),
      mdx(),
      tailwindcss(),
      react()
    ]
  }
})
