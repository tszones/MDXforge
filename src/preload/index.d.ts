import { ElectronAPI } from '@electron-toolkit/preload'

export interface MdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  content: string
  raw: string
}

export interface MdxFolderEntry {
  path: string
  name: string
  relativePath: string
  title?: string
}

export interface MdxFolder {
  rootPath: string
  name: string
  files: MdxFolderEntry[]
}

export interface MdxWorkspace {
  file: MdxFile
  folder?: MdxFolder
}

export interface AppAPI {
  openMdxFile: () => Promise<MdxWorkspace | null>
  openMdxFolder: () => Promise<MdxWorkspace | null>
  openMdxPath: (filePath: string) => Promise<MdxWorkspace>
  registerDefaultMdxApp: () => Promise<boolean>
  isDefaultMdxApp: () => Promise<boolean>
  onMdxFileOpened: (callback: (workspace: MdxWorkspace) => void) => () => void
  onMdxFileOpenError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppAPI
  }
}
