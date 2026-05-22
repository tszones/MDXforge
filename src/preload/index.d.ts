import { ElectronAPI } from '@electron-toolkit/preload'

export interface MdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  content: string
  raw: string
}

export interface AppAPI {
  openMdxFile: () => Promise<MdxFile | null>
  registerDefaultMdxApp: () => Promise<boolean>
  isDefaultMdxApp: () => Promise<boolean>
  onMdxFileOpened: (callback: (file: MdxFile) => void) => () => void
  onMdxFileOpenError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppAPI
  }
}
