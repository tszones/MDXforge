export interface RenderedMdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  html: string
  raw: string
}
