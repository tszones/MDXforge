import { existsSync, readFileSync, statSync } from 'fs'
import { extname, resolve } from 'path'

export function readMdxRawSource(filePath: string): string {
  const resolvedPath = resolve(filePath)

  if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
    throw new Error(`No MDX / Markdown file found: ${filePath}`)
  }

  const extension = extname(resolvedPath).toLowerCase()
  if (extension !== '.mdx' && extension !== '.md') {
    throw new Error(`No MDX / Markdown file found: ${filePath}`)
  }

  return readFileSync(resolvedPath, 'utf-8')
}
