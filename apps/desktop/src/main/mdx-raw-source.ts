import { existsSync, readFileSync, statSync } from 'fs'
import { extname, resolve } from 'path'
import { isViewableDocumentPath } from './viewable-documents'

export function readMdxRawSource(filePath: string): string {
  const resolvedPath = resolve(filePath)

  if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
    throw new Error(`No MDX / Markdown file found: ${filePath}`)
  }

  if (!isViewableDocumentPath(resolvedPath)) {
    throw new Error(`No MDX / Markdown file found: ${filePath}`)
  }

  const extension = extname(resolvedPath).toLowerCase()
  if (extension === '.pdf') return ''

  return readFileSync(resolvedPath, 'utf-8')
}
