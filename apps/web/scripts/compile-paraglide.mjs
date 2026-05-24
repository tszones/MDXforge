import { compile } from '@inlang/paraglide-js'

await compile({
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
})
