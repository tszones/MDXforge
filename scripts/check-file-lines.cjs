#!/usr/bin/env node

const { existsSync, readdirSync, readFileSync, statSync } = require('node:fs')
const { extname, join, relative, sep } = require('node:path')

const root = process.cwd()
const maxLines = Number.parseInt(process.env.FILE_LINE_MAX ?? '500', 10)
const sourceRoots = ['apps', 'packages']
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const ignoredSegments = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.turbo',
  '.source',
  'coverage',
  'paraglide',
  'generated'
])
const ignoredFilePatterns = [
  /\.d\.ts$/,
  /\.config\.[cm]?[jt]s$/,
  /\.test\.[cm]?[jt]sx?$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /^packages\/ui\/src\/components\/sidebar\.tsx$/
]

if (!Number.isInteger(maxLines) || maxLines < 1) {
  console.error('FILE_LINE_MAX must be a positive integer')
  process.exit(1)
}

const violations = []

for (const sourceRoot of sourceRoots) {
  const directory = join(root, sourceRoot)
  if (existsSync(directory)) walk(directory)
}

if (violations.length > 0) {
  violations.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file))
  console.error(`File line limit exceeded (max ${maxLines} lines):`)
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.lines} lines`)
  }
  console.error('\nRefactor oversized files by responsibility, or add a generated/config exception if justified.')
  process.exit(1)
}

console.log(`File line limits OK (max ${maxLines} lines)`)

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name)
    const rel = toPosixPath(relative(root, path))
    if (rel.split('/').some((segment) => ignoredSegments.has(segment))) continue

    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }

    if (!sourceExtensions.has(extname(path))) continue
    if (ignoredFilePatterns.some((pattern) => pattern.test(rel))) continue

    const lines = countLines(readFileSync(path, 'utf8'))
    if (lines > maxLines) violations.push({ file: rel, lines })
  }
}

function countLines(source) {
  if (source.length === 0) return 0
  const normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines.length
}

function toPosixPath(path) {
  return path.split(sep).join('/')
}
