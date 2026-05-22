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
