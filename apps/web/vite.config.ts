import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    tailwindcss(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    tanstackStart({
      srcDirectory: 'src',
      start: { entry: './start.tsx' }
    }),
    viteReact()
  ]
})
