import { relative } from 'path'
import { assignFolderMetadata, buildFolderChildren, flattenFiles } from './page-tree-build'
import { attachDocumentLinks } from './page-tree-links'
import { scanFolder } from './page-tree-scan'
import type {
  MdxDocumentBacklink,
  MdxDocumentLink,
  MdxFolder,
  MdxFolderEntry,
  MdxFolderTreeNode
} from './page-tree-types'
import {
  cleanSegmentName,
  isGroupFolder,
  isIndexStem,
  stripMarkdownExtension
} from './page-tree-utils'

export type { MdxDocumentBacklink, MdxDocumentLink, MdxFolder, MdxFolderEntry, MdxFolderTreeNode }

export function readMdxFolder(rootPath: string): MdxFolder {
  const root = scanFolder(rootPath, '', '')
  const files = flattenFiles(root)
  attachDocumentLinks(rootPath, files)
  const folder: MdxFolder = {
    rootPath,
    name: root.meta.title ?? root.name,
    files,
    tree: buildFolderChildren(root)
  }

  assignFolderMetadata(folder, root.meta)
  return folder
}

export function toRelativeDisplayPath(rootPath: string, filePath: string): string {
  const relativePath = relative(rootPath, filePath).replace(/\\/g, '/')
  const parts = relativePath.split('/')
  const fileName = parts.pop()
  if (!fileName) return relativePath

  const stem = stripMarkdownExtension(fileName)
  const displayParts = parts.filter((part) => !isGroupFolder(part)).map(cleanSegmentName)
  if (!isIndexStem(stem)) displayParts.push(cleanSegmentName(stem))

  return displayParts.join('/') || 'index'
}
