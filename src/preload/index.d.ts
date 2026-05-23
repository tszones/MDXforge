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
}

export type MdxFolderTreeNode =
  | { type: 'file'; path: string }
  | {
      type: 'folder'
      name: string
      path: string
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

export interface MdxWorkspace {
  file: MdxFile
  folder?: MdxFolder
}

export interface AppSettings {
  theme: AppThemeName
  colorMode: AppColorMode
  language: AppLanguage
}

export type AppThemeName =
  | 'neutral'
  | 'black'
  | 'vitepress'
  | 'dusk'
  | 'catppuccin'
  | 'ocean'
  | 'purple'
  | 'solar'
  | 'emerald'
  | 'ruby'
  | 'aspen'

export type AppColorMode = 'light' | 'dark'
export type AppLanguage = 'system' | 'zh-CN' | 'en-US'

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

export interface AppVersions {
  chrome?: string
  electron?: string
  node?: string
}

export interface AppAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>
  getVersions: () => AppVersions
  openMdxFile: () => Promise<MdxWorkspace | null>
  openMdxFolder: () => Promise<MdxWorkspace | null>
  openMdxPath: (filePath: string, workspaceRoot?: string) => Promise<MdxWorkspace>
  registerDefaultMdxApp: () => Promise<boolean>
  isDefaultMdxApp: () => Promise<boolean>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getUpdateState: () => Promise<UpdateState>
  checkForUpdates: () => Promise<UpdateState>
  quitAndInstallUpdate: () => Promise<void>
  onUpdateState: (callback: (state: UpdateState) => void) => () => void
  onMdxFileOpened: (callback: (workspace: MdxWorkspace) => void) => () => void
  onMdxFileOpenError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    api: AppAPI
  }
}
