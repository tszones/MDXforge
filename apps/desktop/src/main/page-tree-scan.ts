import { readdirSync } from 'fs'
import { extname, join } from 'path'
import { readMdxMetadata, readMetaFile } from './page-tree-meta'
import type { FolderScan, PageFile } from './page-tree-types'
import {
  cleanSegmentName,
  isGroupFolder,
  isIndexStem,
  isLocaleVariantStem,
  joinPath,
  stripMarkdownExtension
} from './page-tree-utils'

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'out'])
const markdownExtensions = new Set(['.md', '.mdx'])

export function scanFolder(
  absolutePath: string,
  relativePath: string,
  displayPath: string
): FolderScan {
  const meta = readMetaFile(absolutePath)
  const folderName = absolutePath.split(/[\\/]/).filter(Boolean).at(-1) ?? absolutePath
  const name = meta.title ?? cleanSegmentName(folderName)
  const files: PageFile[] = []
  const folders: FolderScan[] = []
  const entries = readdirSync(absolutePath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.vitepress') continue
    if (ignoredDirectories.has(entry.name)) continue
    if (entry.isFile() && entry.name === 'meta.json') continue

    const childAbsolutePath = join(absolutePath, entry.name)
    const childRelativePath = joinPath(relativePath, entry.name)

    if (entry.isDirectory()) {
      const childDisplayPath = isGroupFolder(entry.name)
        ? displayPath
        : joinPath(displayPath, cleanSegmentName(entry.name))

      folders.push(scanFolder(childAbsolutePath, childRelativePath, childDisplayPath))
      continue
    }

    if (!entry.isFile() || !markdownExtensions.has(extname(entry.name).toLowerCase())) continue

    const stem = stripMarkdownExtension(entry.name)
    if (isLocaleVariantStem(stem)) continue

    const displayStem = isIndexStem(stem) ? '' : cleanSegmentName(stem)
    const fileDisplayPath = joinPath(displayPath, displayStem)
    const metadata = readMdxMetadata(childAbsolutePath)

    files.push({
      path: childAbsolutePath,
      name: entry.name,
      stem,
      relativePath: childRelativePath,
      displayPath: fileDisplayPath || 'index',
      slug: fileDisplayPath ? fileDisplayPath.split('/') : [],
      title: metadata.title,
      description: metadata.description,
      icon: metadata.icon
    })
  }

  return { absolutePath, relativePath, displayPath, name, meta, files, folders }
}
