const { spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const { join, resolve } = require('node:path')

const desktopRoot = resolve(__dirname, '..')
const builderArgs = process.argv.slice(2)

function fail(message) {
  console.error(`[build-win] ${message}`)
  process.exit(1)
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('')
}

function run(label, commandName, args) {
  console.log(`[build-win] ${label}: ${commandName} ${args.join(' ')}`)
  const result = spawnSync(commandName, args, {
    cwd: desktopRoot,
    stdio: 'inherit',
    shell: false
  })

  if (result.error) fail(`${label} failed: ${result.error.message}`)
  if (result.status !== 0) fail(`${label} exited with code ${result.status}`)
}

if (builderArgs.length === 0) builderArgs.push('--win')

const outputDir = join('dist', `win-${formatTimestamp(new Date())}`)
const appAsarPath = join(outputDir, 'win-unpacked', 'resources', 'app.asar')

const electronBuilderCli = require.resolve('electron-builder/cli.js', { paths: [desktopRoot] })

run('electron-builder', process.execPath, [
  electronBuilderCli,
  ...builderArgs,
  `--config.directories.output=${outputDir}`
])

if (!existsSync(join(desktopRoot, appAsarPath))) {
  fail(`missing ${appAsarPath}`)
}

run('verify-app-asar', process.execPath, [
  join('scripts', 'verify-app-asar.cjs'),
  appAsarPath
])

console.log(`[build-win] ok: ${outputDir}`)
