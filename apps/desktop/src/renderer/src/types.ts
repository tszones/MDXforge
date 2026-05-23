export const APP_LANGUAGE_OPTIONS = ['system', 'zh-CN', 'en-US'] as const
export const APP_FONT_OPTIONS = ['system', 'bricolage', 'serif', 'mono'] as const

export type AppLanguage = (typeof APP_LANGUAGE_OPTIONS)[number]
export type AppFontName = (typeof APP_FONT_OPTIONS)[number]

export interface MdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  content: string
  compiledSource: string
  compileError?: string
  raw: string
}

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

export interface TextSearchMatch {
  line: number
  column: number
  preview: string
}

export interface MdxWorkspaceSearchResult {
  path: string
  name: string
  relativePath: string
  displayPath: string
  title?: string
  description?: string
  matches: TextSearchMatch[]
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

export type ExtensionMode = 'safe' | 'trusted'
export type ExtensionPackageType =
  | 'component'
  | 'theme'
  | 'rules'
  | 'template'
  | 'transform'
  | 'resource'

export interface WorkspaceExtensionAsset {
  path: string
  url?: string
}

export interface WorkspaceExtensionPackage {
  name: string
  version: string
  type: ExtensionPackageType
  rootPath: string
  entryPath: string
  entryUrl: string
  styles: Array<Required<WorkspaceExtensionAsset>>
  rules: WorkspaceExtensionAsset[]
}

export interface WorkspaceExtensionWarning {
  source: string
  status: 'blocked' | 'missing' | 'invalid' | 'unsupported'
  reason: string
}

export interface WorkspaceExtensionManifest {
  mode: ExtensionMode
  workspaceRoot: string
  packages: WorkspaceExtensionPackage[]
  warnings: WorkspaceExtensionWarning[]
}

export interface MdxWorkspace {
  file: MdxFile
  folder?: MdxFolder
  extensions?: WorkspaceExtensionManifest
}

export interface UpdateState {
  status:
    | 'idle'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  version: string
  availableVersion?: string
  percent?: number
  message?: string
}
