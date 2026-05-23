#!/usr/bin/env node
const { existsSync } = require('node:fs')
const { dirname, join, resolve } = require('node:path')
const { spawn } = require('node:child_process')

function getExePath() {
  if (process.env.MDXFORGE_APP_PATH) return process.env.MDXFORGE_APP_PATH

  const localExe = join(__dirname, '..', 'dist', 'win-unpacked', 'mdxforge.exe')
  if (existsSync(localExe)) return localExe

  if (process.platform === 'win32') {
    return join(process.env.LOCALAPPDATA || '', 'Programs', 'mdxforge', 'mdxforge.exe')
  }

  if (process.platform === 'darwin') return '/Applications/MDXForge.app/Contents/MacOS/MDXForge'

  return 'mdxforge'
}

const target = process.argv[2] ? resolve(process.argv[2]) : process.cwd()
const exePath = getExePath()
const child = spawn(exePath, [target], {
  detached: true,
  stdio: 'ignore',
  cwd: dirname(target)
})

child.unref()
