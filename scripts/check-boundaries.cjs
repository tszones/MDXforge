#!/usr/bin/env node

const { readFileSync, readdirSync, statSync } = require('node:fs')
const { join, relative, sep } = require('node:path')

const root = process.cwd()
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const ignoredSegments = new Set(['node_modules', 'dist', 'out', '.turbo', '.source', 'paraglide'])
const violations = []

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name)
    const rel = relative(root, path)
    if (rel.split(sep).some((segment) => ignoredSegments.has(segment))) continue

    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }

    if (!sourceExtensions.has(path.slice(path.lastIndexOf('.')))) continue
    checkFile(rel, readFileSync(path, 'utf8'))
  }
}

function checkFile(file, source) {
  const imports = [...source.matchAll(/(?:import|export)\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g)].map(
    (match) => match[1]
  )

  for (const specifier of imports) {
    const resolved = resolveWorkspaceImport(file, specifier)
    if (!resolved) continue

    if (file.startsWith('packages/') && resolved.startsWith('apps/')) {
      addViolation(file, specifier, 'packages must not import apps')
    }

    if (file.startsWith('apps/web/') && resolved.startsWith('apps/desktop/')) {
      addViolation(file, specifier, 'apps/web must not import apps/desktop')
    }

    if (file.startsWith('apps/desktop/') && resolved.startsWith('apps/web/')) {
      addViolation(file, specifier, 'apps/desktop must not import apps/web')
    }

    if (
      file.startsWith('packages/ui/') &&
      resolved.startsWith('packages/') &&
      !resolved.startsWith('packages/ui/')
    ) {
      addViolation(file, specifier, 'packages/ui must not import other business packages')
    }
  }
}

function resolveWorkspaceImport(file, specifier) {
  if (specifier.startsWith('@mdxforge/')) {
    const [, packageName] = specifier.match(/^@mdxforge\/([^/]+)/) ?? []
    if (!packageName) return null
    return `packages/${packageName}/`
  }

  if (!specifier.startsWith('.')) return null

  const importerDirectory = file.split('/').slice(0, -1).join('/')
  const normalized = normalizePath(join(importerDirectory, specifier))
  if (normalized.startsWith('apps/') || normalized.startsWith('packages/')) return normalized
  return null
}

function normalizePath(path) {
  const parts = []
  for (const part of path.split(sep)) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return parts.join('/')
}

function addViolation(file, specifier, message) {
  violations.push(`${file}: ${message}: ${specifier}`)
}

walk(join(root, 'apps'))
walk(join(root, 'packages'))

if (violations.length > 0) {
  console.error('Import boundary violations:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log('Import boundaries OK')
