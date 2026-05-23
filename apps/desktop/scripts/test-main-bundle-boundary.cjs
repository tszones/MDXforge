const fs = require('node:fs')
const path = require('node:path')

const mainBundlePath = path.resolve(__dirname, '..', 'out', 'main', 'index.js')

if (!fs.existsSync(mainBundlePath)) {
  console.error(
    'Missing main bundle. Run `pnpm run build` or `pnpm exec electron-vite build` first.'
  )
  process.exit(1)
}

const source = fs.readFileSync(mainBundlePath, 'utf8')
const esmOnlyRuntimePackages = [
  '@mdx-js/mdx',
  'fumadocs-core',
  'fumadocs-twoslash',
  'rehype-katex',
  'remark-math'
]

const failures = esmOnlyRuntimePackages.filter((packageName) => {
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`require\\(["']${escaped}(?:/[^"']*)?["']\\)`).test(source)
})

if (failures.length > 0) {
  console.error('Main bundle still requires ESM-only MDX runtime packages:')
  for (const packageName of failures) console.error(`- ${packageName}`)
  process.exit(1)
}

console.log('Main bundle ESM dependency boundary is clean')
