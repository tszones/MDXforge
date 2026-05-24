import { fileURLToPath, URL } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig(async () => ({
  server: {
    allowedHosts: ['.trycloudflare.com']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    tailwindcss(),
    ...(await mdx()),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      isServer: 'import.meta.env?.SSR ?? typeof window === "undefined"',
      emitTsDeclarations: true,
      outputStructure: 'locale-modules',
      urlPatterns: [
        {
          pattern: ':protocol://:domain(.*)::port?/:path(.*)?',
          localized: [
            ['en', ':protocol://:domain(.*)::port?/en/:path(.*)?'],
            ['zh', ':protocol://:domain(.*)::port?/zh/:path(.*)?']
          ]
        }
      ]
    }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    tanstackStart({
      srcDirectory: 'src',
      start: { entry: './start.tsx' },
      server: { entry: './server.ts' }
    }),
    viteReact(),
    cloudflare({
      viteEnvironment: {
        name: 'ssr'
      }
    })
  ]
}))
