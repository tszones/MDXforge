import { ElectronAPI } from '@electron-toolkit/preload'

export interface RenderedMdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  html: string
  raw: string
}

export interface AppAPI {
  openMdxFile: () => Promise<RenderedMdxFile | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppAPI
  }
}
