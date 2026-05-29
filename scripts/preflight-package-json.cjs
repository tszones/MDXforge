const { existsSync, readFileSync, statSync } = require('node:fs')
const { join, resolve } = require('node:path')

const repoRoot = resolve(__dirname, '..')

function fail(message) {
  console.error(`[preflight-package-json] ${message}`)
  process.exit(1)
}

function readJson(relativePath) {
  const filePath = join(repoRoot, relativePath)

  if (!existsSync(filePath)) fail(`Missing ${relativePath}`)

  let text
  try {
    text = readFileSync(filePath, 'utf8')
  } catch (error) {
    fail(`Cannot read ${relativePath}: ${error.message}`)
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`)
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`)
}

const rootPackage = readJson('package.json')
assertEqual(rootPackage.name, 'mdxforge', 'root package name')
assertEqual(rootPackage.private, true, 'root private')
assertString(rootPackage.packageManager, 'root packageManager')
if (!rootPackage.packageManager.startsWith('pnpm@')) {
  fail(`root packageManager must start with "pnpm@", got ${JSON.stringify(rootPackage.packageManager)}`)
}
if (!rootPackage.scripts || typeof rootPackage.scripts !== 'object') {
  fail('root scripts must exist')
}

const desktopPackage = readJson('apps/desktop/package.json')
assertEqual(desktopPackage.name, '@mdxforge/desktop', 'desktop package name')
assertEqual(desktopPackage.main, './out/main/index.js', 'desktop main')
assertEqual(desktopPackage.private, true, 'desktop private')
if (!desktopPackage.scripts || typeof desktopPackage.scripts !== 'object') {
  fail('desktop scripts must exist')
}

for (const relativePath of [
  'apps/desktop/electron-builder.yml',
  'apps/desktop/src/main/index.ts',
  'apps/desktop/src/preload/index.ts',
  'apps/desktop/src/renderer/index.html'
]) {
  const filePath = join(repoRoot, relativePath)
  if (!existsSync(filePath)) fail(`Missing required file ${relativePath}`)
  if (!statSync(filePath).isFile()) fail(`${relativePath} must be a file`)
}

console.log('[preflight-package-json] ok')
