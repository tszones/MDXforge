export interface MdxFolderEntry {
  path: string
  name: string
  relativePath: string
  displayPath: string
  slug: string[]
  title?: string
  description?: string
  icon?: string
  links: MdxDocumentLink[]
  backlinks: MdxDocumentBacklink[]
}

export interface MdxDocumentLink {
  href: string
  label: string
  targetPath: string
  targetRelativePath: string
  targetDisplayPath: string
  targetTitle?: string
}

export interface MdxDocumentBacklink {
  sourcePath: string
  sourceRelativePath: string
  sourceDisplayPath: string
  sourceTitle?: string
  label: string
  href: string
}

export type MdxFolderTreeNode =
  | { type: 'file'; path: string }
  | {
      type: 'folder'
      name: string
      path: string
      absolutePath: string
      description?: string
      icon?: string
      root?: boolean
      defaultOpen?: boolean
      collapsible?: boolean
      children: MdxFolderTreeNode[]
    }
  | { type: 'separator'; label: string; icon?: string }
  | { type: 'link'; label: string; href: string; external?: boolean; icon?: string }

export interface MdxFolder {
  rootPath: string
  name: string
  description?: string
  icon?: string
  root?: boolean
  files: MdxFolderEntry[]
  tree: MdxFolderTreeNode[]
}

export interface MetaFile {
  title?: string
  description?: string
  icon?: string
  root?: boolean
  pages?: string[]
  defaultOpen?: boolean
  collapsible?: boolean
}

export interface FolderScan {
  absolutePath: string
  relativePath: string
  displayPath: string
  name: string
  meta: MetaFile
  files: PageFile[]
  folders: FolderScan[]
}

export interface PageFile {
  path: string
  name: string
  stem: string
  relativePath: string
  displayPath: string
  slug: string[]
  title?: string
  description?: string
  icon?: string
}

export type OrderedItem =
  | { type: 'file'; key: string; file: PageFile }
  | { type: 'folder'; key: string; folder: FolderScan }
  | { type: 'separator'; key: string; label: string; icon?: string }
  | { type: 'link'; key: string; label: string; href: string; external?: boolean; icon?: string }
