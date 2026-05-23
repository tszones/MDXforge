const fs = require('node:fs')
const path = require('node:path')

const rendererRoot = path.resolve(__dirname, '..', 'src', 'renderer', 'src')

const forbiddenImports = [
  {
    pattern: /(?:from\s+|import\(|require\()['"]@mdx-js\/mdx['"]/,
    reason: '@mdx-js/mdx pulls the compiler into the browser bundle'
  },
  {
    pattern: /(?:from\s+|import\(|require\()['"]fumadocs-twoslash['"]/,
    reason: 'fumadocs-twoslash pulls twoslash/typescript into the browser bundle'
  },
  {
    pattern: /(?:from\s+|import\(|require\()['"]fumadocs-core\/mdx-plugins\//,
    reason: 'Fumadocs MDX compile plugins belong in the Electron main process'
  },
  {
    pattern: /(?:from\s+|import\(|require\()['"]rehype-katex['"]/,
    reason: 'rehype compile plugins belong in the Electron main process'
  },
  {
    pattern: /(?:from\s+|import\(|require\()['"]remark-math['"]/,
    reason: 'remark compile plugins belong in the Electron main process'
  }
]

function listSourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return listSourceFiles(fullPath)
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : []
  })
}

const failures = []

for (const filePath of listSourceFiles(rendererRoot)) {
  const source = fs.readFileSync(filePath, 'utf8')

  for (const forbidden of forbiddenImports) {
    if (forbidden.pattern.test(source)) {
      failures.push(`${path.relative(process.cwd(), filePath)}: ${forbidden.reason}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Renderer compile-boundary violations found:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Renderer compile boundary is clean')
