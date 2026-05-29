const { existsSync } = require('node:fs')
const { resolve, sep } = require('node:path')
const asar = require('@electron/asar')

const appAsarPath = process.argv[2]

function fail(message) {
  console.error(`[inspect-asar-package] ${message}`)
  process.exit(1)
}

if (!appAsarPath) {
  fail('Usage: node scripts/inspect-asar-package.cjs <path-to-app.asar>')
}

const resolvedAsarPath = resolve(appAsarPath)
if (!existsSync(resolvedAsarPath)) fail(`Missing app.asar: ${resolvedAsarPath}`)

let content
try {
  const packageJsonPath = sep === '\\' ? 'package.json'.replaceAll('/', '\\') : 'package.json'
  content = asar.extractFile(resolvedAsarPath, packageJsonPath).toString('utf8')
} catch (error) {
  fail(`Cannot read package.json from app.asar: ${error.message}`)
}

try {
  const parsed = JSON.parse(content)
  console.log(JSON.stringify(parsed, null, 2))
} catch (error) {
  fail(`Invalid package.json inside app.asar: ${error.message}`)
}
