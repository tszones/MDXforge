export type MdxFileKind = 'markdown' | 'html' | 'pdf' | 'unsupported'

export interface MdxFile {
  path: string
  name: string
  kind: MdxFileKind
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

export interface WorkspaceSkillsState {
  workspaceRoot: string
  skills: WorkspaceSkill[]
  mergedRules: string
}

export interface WorkspaceSkill {
  source: string
  kind: 'builtin' | 'workspace' | 'npm' | 'git' | 'unknown'
  status: 'active' | 'disabled' | 'missing' | 'invalid' | 'unsupported' | 'blocked'
  name: string
  title: string
  version: string
  types: Array<'writing' | 'component' | 'template' | 'transform'>
  rootPath?: string
  rules: Array<{ path: string; content: string }>
  components: string[]
  permissions: string[]
  reason?: string
}

export type AgentId = 'claude-code' | 'cursor' | 'codex'

export type AgentIntegrationMode =
  | 'managed-file'
  | 'managed-directory'
  | 'native-plugin'
  | 'copy-only'

export interface AgentDetectionResult {
  id: AgentId
  name: string
  status: 'detected' | 'not-detected' | 'installed' | 'error'
  integrationMode: AgentIntegrationMode
  targetPath?: string
  command?: string
  reason?: string
}

export interface AgentInstallPreview {
  agentId: AgentId
  operation: 'install' | 'disable'
  relativePath: string
  kind: 'file' | 'directory'
  action: 'create' | 'update' | 'copy' | 'delete' | 'conflict'
  before: string
  after: string
  diff: string
  reason?: string
}

export interface MdxWorkspace {
  file: MdxFile
  folder?: MdxFolder
  extensions?: WorkspaceExtensionManifest
}

export interface WorkbenchLayoutSettings {
  horizontal?: Record<string, number>
  centerVertical?: Record<string, number>
}

export interface AppSettings {
  theme: AppThemeName
  colorMode: AppColorMode
  language: AppLanguage
  font: AppFontName
  viewableDocumentExtensions: string[]
  workbenchLayout?: WorkbenchLayoutSettings
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
export type AppFontName = 'system' | 'bricolage' | 'serif' | 'mono'

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
  getInitialSettings: () => AppSettings | null
  openMdxFile: () => Promise<MdxWorkspace | null>
  openMdxFolder: () => Promise<MdxWorkspace | null>
  openMdxPath: (filePath: string, workspaceRoot?: string) => Promise<MdxWorkspace>
  renameMdxPath: (
    targetPath: string,
    nextName: string,
    workspaceRoot?: string
  ) => Promise<MdxWorkspace>
  deleteMdxPath: (targetPath: string, workspaceRoot?: string) => Promise<MdxWorkspace | null>
  copyMdxRawSource: (filePath: string) => Promise<void>
  copyPath: (filePath: string) => Promise<void>
  showInFolder: (filePath: string) => Promise<boolean>
  openInVsCode: (filePath: string) => Promise<boolean>
  searchMdxWorkspace: (workspaceRoot: string, query: string) => Promise<MdxWorkspaceSearchResult[]>
  setWorkspaceExtensionsEnabled: (enabled: boolean, trustKey?: string) => Promise<boolean>
  getWorkspaceSkills: (workspaceRoot: string) => Promise<WorkspaceSkillsState>
  addLocalSkillFolder: (workspaceRoot: string) => Promise<WorkspaceSkillsState | null>
  createLocalSkill: (
    workspaceRoot: string,
    name: string,
    type: 'writing' | 'component' | 'template' | 'transform'
  ) => Promise<WorkspaceSkillsState>
  copySkillRules: (rules: string) => Promise<void>
  detectAgents: () => Promise<AgentDetectionResult[]>
  openAgentPath: (targetPath: string) => Promise<boolean>
  previewAgentInstall: (workspaceRoot: string, agentId: AgentId) => Promise<AgentInstallPreview>
  applyAgentInstall: (workspaceRoot: string, agentId: AgentId) => Promise<AgentInstallPreview>
  previewAgentDisable: (workspaceRoot: string, agentId: AgentId) => Promise<AgentInstallPreview>
  applyAgentDisable: (workspaceRoot: string, agentId: AgentId) => Promise<AgentInstallPreview>
  disableAgentInstall: (workspaceRoot: string, agentId: AgentId) => Promise<AgentInstallPreview>
  registerDefaultMdxApp: () => Promise<boolean>
  isDefaultMdxApp: () => Promise<boolean>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  getUpdateState: () => Promise<UpdateState>
  checkForUpdates: () => Promise<UpdateState>
  quitAndInstallUpdate: () => Promise<void>
  onUpdateState: (callback: (state: UpdateState) => void) => () => void
  onMdxFileOpened: (callback: (workspace: MdxWorkspace) => void) => () => void
  onMdxFileChanged: (callback: (workspace: MdxWorkspace) => void) => () => void
  onMdxFileOpenError: (callback: (message: string) => void) => () => void
  onMdxFileChangeError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    api: AppAPI
  }
}
