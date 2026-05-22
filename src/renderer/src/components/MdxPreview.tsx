import { compile } from '@mdx-js/mdx'
import { rehypeCode } from 'fumadocs-core/mdx-plugins/rehype-code'
import { rehypeToc } from 'fumadocs-core/mdx-plugins/rehype-toc'
import { remarkHeading } from 'fumadocs-core/mdx-plugins/remark-heading'
import type { TOCItemType } from 'fumadocs-core/toc'
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth
} from 'fumadocs-ui/components/sidebar/base'
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { BookOpen, FileText, FolderOpen, PanelLeftClose, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { m } from '../paraglide/messages'
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

type FileTreeNode =
  | { type: 'file'; entry: MdxFolderEntry }
  | { type: 'folder'; name: string; path: string; children: FileTreeNode[] }

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
      sidebar={({ collapseSidebar }) => (
        <PreviewSidebar
          workspace={workspace}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onOpenPath={onOpenPath}
          opening={opening}
          onCollapseSidebar={collapseSidebar}
        />
      )}
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
  opening,
  onCollapseSidebar
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string) => void
  opening: boolean
  onCollapseSidebar?: () => void
}): React.JSX.Element {
  const file = workspace.file
  const tree = useMemo(() => buildFileTree(workspace.folder?.files ?? []), [workspace.folder])

  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full w-[268px] flex-col">
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex">
            <div className="me-auto inline-flex items-center gap-2.5 font-medium text-[0.9375rem]">
              <BookOpen className="size-4 text-fd-primary" />
              <span>Docuforge</span>
            </div>
            {onCollapseSidebar ? (
              <button
                type="button"
                aria-label={m.preview_collapse_sidebar()}
                onClick={onCollapseSidebar}
                className="mb-auto flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                <PanelLeftClose className="size-4" />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onOpenFile}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
          >
            <FileText className="size-4 text-fd-muted-foreground" />
            {opening ? m.actions_opening() : m.actions_open_mdx_file()}
          </button>
          <button
            type="button"
            onClick={onOpenFolder}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
          >
            <FolderOpen className="size-4 text-fd-muted-foreground" />
            {m.actions_open_folder()}
          </button>
          <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground">
            <Search className="size-4" />
            <span>
              {workspace.folder
                ? m.preview_documents_count({ count: workspace.folder.files.length })
                : m.preview_single_file_preview()}
            </span>
          </div>
        </div>

        <div className="fd-scroll-container min-h-0 flex-1 overflow-auto px-3 py-2 [mask:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]">
          <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
            {workspace.folder ? workspace.folder.name : m.preview_current_file()}
          </p>
          {tree.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {tree.map((node) => (
                <FileTreeNodeView
                  key={node.type === 'file' ? node.entry.path : node.path}
                  node={node}
                  activePath={file.path}
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
    </div>
  )
}

function FileTreeNodeView({
  node,
  activePath,
  onOpenPath
}: {
  node: FileTreeNode
  activePath: string
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  if (node.type === 'file') {
    return (
      <FileTreeItem
        entry={node.entry}
        active={node.entry.path === activePath}
        onOpenPath={onOpenPath}
      />
    )
  }

  return <FileTreeFolder node={node} activePath={activePath} onOpenPath={onOpenPath} />
}

function FileTreeFolder({
  node,
  activePath,
  onOpenPath
}: {
  node: Extract<FileTreeNode, { type: 'folder' }>
  activePath: string
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  const active = nodeContainsPath(node, activePath)

  return (
    <SidebarFolder active={active} defaultOpen={active}>
      <SidebarFolderTrigger
        className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:text-fd-foreground [&_svg]:size-4 [&_svg]:shrink-0"
        data-active={active}
      >
        <FolderOpen className="size-4 shrink-0" />
        <span className="truncate">{node.name}</span>
      </SidebarFolderTrigger>
      <SidebarFolderContent className="relative flex flex-col gap-0.5 pt-0.5 before:absolute before:inset-y-1 before:inset-s-2.5 before:w-px before:bg-fd-border before:content-['']">
        {node.children.map((child) => (
          <FileTreeNodeView
            key={child.type === 'file' ? child.entry.path : child.path}
            node={child}
            activePath={activePath}
            onOpenPath={onOpenPath}
          />
        ))}
      </SidebarFolderContent>
    </SidebarFolder>
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
  const depth = useFolderDepth()

  return (
    <SidebarItem
      href="#"
      active={active}
      icon={<FileText className="size-4 shrink-0" />}
      title={entry.relativePath}
      onClick={(event) => {
        event.preventDefault()
        onOpenPath(entry.path)
      }}
      className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-fd-primary data-[active=true]:before:content-[''] [&_svg]:size-4 [&_svg]:shrink-0"
      style={{ paddingInlineStart: getItemOffset(depth) }}
    >
      <span className="truncate">{entry.title ?? entry.name}</span>
    </SidebarItem>
  )
}

function buildFileTree(entries: MdxFolderEntry[]): FileTreeNode[] {
  const root: Array<FileTreeNode> = []

  for (const entry of [...entries].sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    const parts = entry.relativePath.split('/')
    let current = root
    let currentPath = ''

    for (const [index, part] of parts.entries()) {
      const isFile = index === parts.length - 1
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (isFile) {
        current.push({ type: 'file', entry })
        continue
      }

      let folder = current.find(
        (node): node is Extract<FileTreeNode, { type: 'folder' }> =>
          node.type === 'folder' && node.name === part
      )

      if (!folder) {
        folder = { type: 'folder', name: part, path: currentPath, children: [] }
        current.push(folder)
      }

      current = folder.children
    }
  }

  return sortTree(root)
}

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    const aName = a.type === 'file' ? a.entry.name : a.name
    const bName = b.type === 'file' ? b.entry.name : b.name
    return aName.localeCompare(bName)
  })
}

function nodeContainsPath(node: FileTreeNode, activePath: string): boolean {
  if (node.type === 'file') return node.entry.path === activePath
  return node.children.some((child) => nodeContainsPath(child, activePath))
}

function getItemOffset(depth: number): string {
  return `calc(${2 + 3 * depth} * var(--spacing))`
}
