const { existsSync } = require('node:fs')
const { join, resolve } = require('node:path')
const asar = require('@electron/asar')

const repoRoot = resolve(__dirname, '..', '..', '..')
const desktopRoot = resolve(__dirname, '..')
const distRoot = join(desktopRoot, 'dist')
const appAsarPath = process.argv[2] ? resolve(process.argv[2]) : join(distRoot, 'win-unpacked', 'resources', 'app.asar')

function fail(message) {
  console.error(`[verify-app-asar] ${message}`)
  process.exit(1)
}

function readPackageJsonFromAsar() {
  let content
  try {
    content = asar.extractFile(appAsarPath, 'package.json').toString('utf8')
  } catch (error) {
    fail(`Cannot read package.json from ${appAsarPath}: ${error.message}`)
  }

  try {
    return JSON.parse(content)
  } catch (error) {
    fail(`Invalid package.json inside app.asar: ${error.message}`)
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

function assertAsarFile(relativePath) {
  let file
  try {
    file = asar.extractFile(appAsarPath, relativePath)
  } catch (error) {
    fail(`Missing ${relativePath} in app.asar: ${error.message}`)
  }

  if (!Buffer.isBuffer(file) || file.length === 0) {
    fail(`${relativePath} in app.asar is empty`)
  }
}

if (!existsSync(appAsarPath)) fail(`Missing app.asar: ${appAsarPath}`)

const appPackage = readPackageJsonFromAsar()
assertEqual(appPackage.name, '@mdxforge/desktop', 'asar package name')
assertEqual(appPackage.main, './out/main/index.js', 'asar package main')
assertEqual(appPackage.private, true, 'asar package private')

for (const relativePath of [
  'out/main/index.js',
  'out/preload/index.js',
  'out/renderer/index.html'
]) {
  assertAsarFile(relativePath)
}

console.log(`[verify-app-asar] ok: ${appAsarPath.replace(repoRoot + require('node:path').sep, '')}`)
