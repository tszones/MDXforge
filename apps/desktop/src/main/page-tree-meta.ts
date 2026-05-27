import { existsSync, readFileSync, statSync } from 'fs'
import matter from 'gray-matter'
import { extname, join } from 'path'
import type { MetaFile, PageFile } from './page-tree-types'

export function readMetaFile(folderPath: string): MetaFile {
  const filePath = join(folderPath, 'meta.json')
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return {}

  try {
    const value = JSON.parse(readFileSync(filePath, 'utf-8')) as MetaFile
    return typeof value === 'object' && value !== null ? value : {}
  } catch {
    return {}
  }
}

export function readMdxMetadata(
  filePath: string
): Pick<PageFile, 'title' | 'description' | 'icon'> {
  if (!['.md', '.mdx'].includes(extname(filePath).toLowerCase())) return {}

  try {
    const parsed = matter(readFileSync(filePath, 'utf-8'))
    return {
      title: typeof parsed.data.title === 'string' ? parsed.data.title : undefined,
      description:
        typeof parsed.data.description === 'string' ? parsed.data.description : undefined,
      icon: typeof parsed.data.icon === 'string' ? parsed.data.icon : undefined
    }
  } catch {
    return {}
  }
}
