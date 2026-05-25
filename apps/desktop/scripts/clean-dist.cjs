const { rmSync } = require('node:fs')
const { join } = require('node:path')

const distDir = join(__dirname, '..', 'dist')

try {
  rmSync(distDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
} catch (error) {
  console.warn(`Failed to clean ${distDir}: ${error.message}`)
  console.warn(
    'Close any running MDXForge/Electron process, file explorer, or terminal using dist, then retry.'
  )
  process.exit(1)
}
