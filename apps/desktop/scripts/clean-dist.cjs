const { existsSync, mkdirSync, readdirSync, rmSync } = require('node:fs')
const { join } = require('node:path')

const distDir = join(__dirname, '..', 'dist')

try {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true })
  }

  for (const entry of readdirSync(distDir)) {
    rmSync(join(distDir, entry), { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
  }
} catch (error) {
  console.warn(`Failed to clean ${distDir}: ${error.message}`)
  console.warn(
    'Close any running MDXForge/Electron process, file explorer, or terminal using dist, then retry.'
  )
  process.exit(1)
}
