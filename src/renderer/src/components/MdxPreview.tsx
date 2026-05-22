import { compile } from '@mdx-js/mdx'
import { rehypeCode } from 'fumadocs-core/mdx-plugins/rehype-code'
import { rehypeToc } from 'fumadocs-core/mdx-plugins/rehype-toc'
import { remarkHeading } from 'fumadocs-core/mdx-plugins/remark-heading'
import type { TOCItemType } from 'fumadocs-core/toc'
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { BookOpen, FileText, FolderOpen, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import type { MdxFolderEntry, MdxWorkspace } from '../types'
import { MdxDocsLayout, MdxPageContainer } from './MdxDocsLayout'
import { getMDXComponents } from './mdx'

interface MdxPreviewProps {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string) => void
  opening: boolean
}

type MdxModule = {
  default: React.ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>
  toc?: TOCItemType[]
}

const mdxComponents = getMDXComponents()

export function MdxPreview({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  opening
}: MdxPreviewProps): React.JSX.Element {
  const file = workspace.file
  const [module, setModule] = useState<MdxModule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const title = typeof file.frontmatter.title === 'string' ? file.frontmatter.title : file.name
  const description =
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : file.path

  useEffect(() => {
    let canceled = false

    async function compileMdx(): Promise<void> {
      setModule(null)
      setError(null)

      try {
        const compiled = await compile(file.content, {
          outputFormat: 'function-body',
          development: false,
          remarkPlugins: [[remarkHeading, { generateToc: false }]],
          rehypePlugins: [rehypeCode, rehypeToc]
        })
        const fn = new Function(String(compiled))
        const nextModule = fn(runtime) as MdxModule

        if (!canceled) setModule(nextModule)
      } catch (cause) {
        if (!canceled) setError(cause instanceof Error ? cause.message : String(cause))
      }
    }

    void compileMdx()

    return () => {
      canceled = true
    }
  }, [file.content])

  const Mdx = module?.default
  const toc = module?.toc?.filter((item) => item.depth > 1) ?? []

  return (
    <MdxDocsLayout
      toc={toc}
      sidebar={
        <PreviewSidebar
          workspace={workspace}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onOpenPath={onOpenPath}
          opening={opening}
        />
      }
    >
      <MdxPageContainer>
        <DocsTitle>{title}</DocsTitle>
        <DocsDescription>{description}</DocsDescription>

        {error ? (
          <pre className="overflow-auto rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </pre>
        ) : null}

        {Mdx ? (
          <DocsBody className="docuforge-mdx max-w-none text-fd-foreground/90 dark:prose-invert">
            <Mdx components={mdxComponents} />
          </DocsBody>
        ) : null}
      </MdxPageContainer>
    </MdxDocsLayout>
  )
}

function PreviewSidebar({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  opening
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string) => void
  opening: boolean
}): React.JSX.Element {
  const file = workspace.file
  const files = useMemo(() => groupFolderEntries(workspace.folder?.files ?? []), [workspace.folder])

  return (
    <aside className="hidden h-full min-h-0 border-r bg-fd-card text-sm md:block [grid-area:sidebar]">
      <div className="flex h-full w-[268px] flex-col">
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex items-center gap-2.5 font-medium text-[0.9375rem]">
            <BookOpen className="size-4 text-fd-primary" />
            <span>Docuforge</span>
          </div>
          <button
            type="button"
            onClick={onOpenFile}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
          >
            <FileText className="size-4 text-fd-muted-foreground" />
            {opening ? '打开中…' : '打开 MDX 文件'}
          </button>
          <button
            type="button"
            onClick={onOpenFolder}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
          >
            <FolderOpen className="size-4 text-fd-muted-foreground" />
            打开文件夹
          </button>
          <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground">
            <Search className="size-4" />
            <span>{workspace.folder ? `${files.length} 个文档` : '单文件预览'}</span>
          </div>
        </div>

        <div className="fd-scroll-container flex-1 overflow-auto px-3 py-2">
          <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
            {workspace.folder ? workspace.folder.name : '当前文件'}
          </p>
          {files.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {files.map((entry) => (
                <FileTreeItem
                  key={entry.path}
                  entry={entry}
                  active={entry.path === file.path}
                  onOpenPath={onOpenPath}
                />
              ))}
            </div>
          ) : (
            <div className="relative flex flex-row items-center gap-2 rounded-lg bg-fd-primary/10 p-2 text-start text-fd-primary wrap-anywhere">
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{file.name}</span>
            </div>
          )}
          <p className="mt-3 px-2 text-xs leading-5 text-fd-muted-foreground wrap-anywhere">
            {file.path}
          </p>
        </div>
      </div>
    </aside>
  )
}

function FileTreeItem({
  entry,
  active,
  onOpenPath
}: {
  entry: MdxFolderEntry
  active: boolean
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  const depth = Math.max(0, entry.relativePath.split('/').length - 1)

  return (
    <button
      type="button"
      onClick={() => onOpenPath(entry.path)}
      data-active={active}
      title={entry.relativePath}
      className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
      style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
    >
      <FileText className="size-4 shrink-0" />
      <span className="truncate">{entry.title ?? entry.name}</span>
    </button>
  )
}

function groupFolderEntries(entries: MdxFolderEntry[]): MdxFolderEntry[] {
  return [...entries].sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}
