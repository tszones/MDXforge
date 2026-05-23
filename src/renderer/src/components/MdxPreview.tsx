import type { TOCItemType } from 'fumadocs-core/toc'
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth
} from 'fumadocs-ui/components/sidebar/base'
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  PanelLeft,
  PanelLeftClose,
  Search,
  X
} from 'lucide-react'
import { Component, useEffect, useMemo, useRef, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { filterFileEntries } from '../lib/search-model'
import { m } from '../paraglide/messages'
import type { MdxDocumentBacklink, MdxFolderEntry, MdxFolderTreeNode, MdxWorkspace } from '../types'
import { MdxDocsLayout, MdxPageContainer } from './MdxDocsLayout'
import { getMDXComponents } from './mdx'

interface MdxPreviewProps {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
}

type MdxModule = {
  default: React.ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>
  toc?: TOCItemType[]
}

type FileTreeNode =
  | { type: 'file'; entry: MdxFolderEntry }
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
      children: FileTreeNode[]
    }
  | { type: 'separator'; label: string; icon?: string }
  | { type: 'link'; label: string; href: string; external?: boolean; icon?: string }

type MdxRenderBoundaryProps = {
  children: React.ReactNode
  sourceKey: string
  onError: (message: string) => void
}

type MdxRenderBoundaryState = {
  sourceKey: string
  error: string | null
}

class MdxRenderBoundary extends Component<MdxRenderBoundaryProps, MdxRenderBoundaryState> {
  state: MdxRenderBoundaryState = {
    sourceKey: this.props.sourceKey,
    error: null
  }

  static getDerivedStateFromError(cause: unknown): Partial<MdxRenderBoundaryState> {
    return { error: cause instanceof Error ? cause.message : String(cause) }
  }

  static getDerivedStateFromProps(
    props: MdxRenderBoundaryProps,
    state: MdxRenderBoundaryState
  ): Partial<MdxRenderBoundaryState> | null {
    if (props.sourceKey !== state.sourceKey) return { sourceKey: props.sourceKey, error: null }
    return null
  }

  componentDidCatch(cause: unknown): void {
    this.props.onError(cause instanceof Error ? cause.message : String(cause))
  }

  render(): React.ReactNode {
    if (this.state.error) return null
    return this.props.children
  }
}

export function MdxPreview({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  opening
}: MdxPreviewProps): React.JSX.Element {
  const file = workspace.file
  const [module, setModule] = useState<MdxModule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const title = typeof file.frontmatter.title === 'string' ? file.frontmatter.title : file.name
  const description =
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : file.path
  const currentEntry = useMemo(
    () => workspace.folder?.files.find((entry) => entry.path === file.path),
    [file.path, workspace.folder]
  )
  const documentLinksByHref = useMemo(() => buildDocumentLinkMap(currentEntry), [currentEntry])
  const mdxComponents = useMemo(
    () =>
      getMDXComponents({
        a: (props) => (
          <DocumentLink
            {...props}
            linksByHref={documentLinksByHref}
            workspaceRoot={workspace.folder?.rootPath}
            onOpenPath={onOpenPath}
          />
        )
      }),
    [documentLinksByHref, onOpenPath, workspace.folder?.rootPath]
  )

  useEffect(() => {
    let canceled = false

    async function compileMdx(): Promise<void> {
      setModule(null)
      setError(file.compileError ?? null)

      if (file.compileError) return

      try {
        const fn = new Function(file.compiledSource)
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
  }, [file.compiledSource, file.compileError])

  const Mdx = module?.default
  const toc = module?.toc?.filter((item) => item.depth > 1) ?? []

  return (
    <MdxDocsLayout
      toc={toc}
      sidebar={({ collapsed, collapseSidebar, expandSidebar }) => (
        <PreviewSidebar
          workspace={workspace}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onOpenPath={onOpenPath}
          onRenamePath={onRenamePath}
          opening={opening}
          collapsed={collapsed}
          onCollapseSidebar={collapseSidebar}
          onExpandSidebar={expandSidebar}
        />
      )}
    >
      <MdxPageContainer>
        <DocsTitle>{title}</DocsTitle>
        <DocsDescription>{description}</DocsDescription>

        {error ? (
          <pre className="overflow-auto rounded-md border bg-fd-error/10 p-4 text-sm text-fd-error">
            {error}
          </pre>
        ) : null}

        {Mdx && !error ? (
          <MdxRenderBoundary sourceKey={file.compiledSource} onError={setError}>
            <DocsBody className="mdxforge-mdx max-w-none text-fd-foreground/90 dark:prose-invert">
              <Mdx components={mdxComponents} />
            </DocsBody>
          </MdxRenderBoundary>
        ) : null}

        {currentEntry && currentEntry.backlinks.length > 0 ? (
          <Backlinks
            backlinks={currentEntry.backlinks}
            onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
          />
        ) : null}
      </MdxPageContainer>
    </MdxDocsLayout>
  )
}

function DocumentLink({
  href,
  children,
  linksByHref,
  workspaceRoot,
  onOpenPath,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  linksByHref: Map<string, MdxFolderEntry['links'][number]>
  workspaceRoot?: string
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}): React.JSX.Element {
  const target = typeof href === 'string' ? linksByHref.get(normalizeDocumentHref(href)) : undefined

  if (!target) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a
      href={href}
      {...props}
      data-mdxforge-document-link
      title={target.targetRelativePath}
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented || shouldUseNativeLinkClick(event)) return

        event.preventDefault()
        onOpenPath(target.targetPath, workspaceRoot)
      }}
    >
      {children}
    </a>
  )
}

function Backlinks({
  backlinks,
  onOpenPath
}: {
  backlinks: MdxDocumentBacklink[]
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  return (
    <section className="mt-6 border-t pt-5">
      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
        <Link2 className="size-4" />
        {m.preview_backlinks_title({ count: backlinks.length })}
      </h2>
      <div className="grid gap-2">
        {backlinks.map((backlink) => (
          <button
            key={`${backlink.sourcePath}:${backlink.href}:${backlink.label}`}
            type="button"
            onClick={() => onOpenPath(backlink.sourcePath)}
            className="rounded-lg border bg-fd-card px-3 py-2 text-start transition-colors hover:bg-fd-accent/50"
          >
            <span className="block truncate text-sm font-medium">
              {backlink.sourceTitle ?? backlink.sourceDisplayPath}
            </span>
            <span className="mt-0.5 block truncate text-xs text-fd-muted-foreground">
              {m.preview_backlink_context({ label: backlink.label })}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function PreviewSidebar({
  workspace,
  onOpenFile,
  onOpenFolder,
  onOpenPath,
  onRenamePath,
  opening,
  collapsed,
  onCollapseSidebar,
  onExpandSidebar
}: {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
  collapsed?: boolean
  onCollapseSidebar?: () => void
  onExpandSidebar?: () => void
}): React.JSX.Element {
  const file = workspace.file
  const [query, setQuery] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const tree = useMemo(
    () => buildFileTree(workspace.folder?.files ?? [], workspace.folder?.tree),
    [workspace.folder]
  )
  const searchResults = useMemo(
    () => filterFileEntries(workspace.folder?.files ?? [], query),
    [workspace.folder?.files, query]
  )
  const searching = query.trim().length > 0

  useEffect(() => {
    if (workspace.file.path) setCopyState('idle')
  }, [workspace.file.path])

  useEffect(() => {
    if (copyState === 'idle') return

    const timer = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [copyState])

  async function copyRawSource(): Promise<void> {
    try {
      await window.api.copyMdxRawSource(file.path)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className="h-full min-h-0 bg-fd-card text-sm">
      <div className="flex h-full w-[268px] flex-col">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">
          <div className="flex">
            <div className="me-auto min-w-0">
              <div className="inline-flex items-center gap-2.5 font-medium text-[0.9375rem]">
                <BookOpen className="size-4 shrink-0 text-fd-primary" />
                <span>MDXForge</span>
              </div>
              <p className="mt-1 truncate text-xs text-fd-muted-foreground">
                {workspace.folder ? workspace.folder.name : m.preview_single_file_preview()}
              </p>
            </div>
            {onCollapseSidebar ? (
              <button
                type="button"
                aria-label={collapsed ? m.preview_expand_sidebar() : m.preview_collapse_sidebar()}
                onClick={collapsed ? onExpandSidebar : onCollapseSidebar}
                className="mb-auto flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                {collapsed ? (
                  <PanelLeft className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
            ) : null}
          </div>
          {workspace.folder ? (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={m.preview_search_placeholder()}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="rounded p-0.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
                  aria-label={m.preview_clear_search()}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 px-2.5 py-2 text-fd-muted-foreground">
              <FileText className="size-4" />
              <span>{m.preview_single_file_preview()}</span>
            </div>
          )}
        </div>

        <div className="fd-scroll-container min-h-0 flex-1 overflow-auto px-3 py-2 [mask:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]">
          <p className="mb-1 px-2 text-xs font-medium text-fd-muted-foreground">
            {searching
              ? m.preview_search_results({ count: searchResults.length })
              : workspace.folder
                ? m.preview_files_nav()
                : m.preview_current_file()}
          </p>
          {searching ? (
            <div className="flex flex-col gap-0.5">
              {searchResults.map((entry) => (
                <SearchResultItem
                  key={entry.path}
                  entry={entry}
                  active={entry.path === file.path}
                  onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
                />
              ))}
            </div>
          ) : tree.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {tree.map((node, index) => (
                <FileTreeNodeView
                  key={getTreeNodeKey(node, index)}
                  node={node}
                  activePath={file.path}
                  onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
                  onRenamePath={(targetPath, nextName) =>
                    onRenamePath(targetPath, nextName, workspace.folder?.rootPath)
                  }
                  renamingPath={renamingPath}
                  onStartRename={setRenamingPath}
                  onStopRename={() => setRenamingPath(null)}
                />
              ))}
            </div>
          ) : (
            <div className="relative flex flex-row items-center gap-2 rounded-lg bg-fd-primary/10 p-2 text-start text-fd-primary wrap-anywhere">
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{file.name}</span>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <p className="mb-2 line-clamp-2 px-1 text-xs leading-5 text-fd-muted-foreground wrap-anywhere">
            {file.path}
          </p>
          <button
            type="button"
            onClick={() => void copyRawSource()}
            title={m.actions_copy_raw_source()}
            aria-label={m.actions_copy_raw_source()}
            className="mb-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border bg-fd-secondary/50 px-2 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=copied]:border-fd-primary/40 data-[state=copied]:bg-fd-primary/10 data-[state=copied]:text-fd-primary data-[state=error]:border-fd-error/40 data-[state=error]:bg-fd-error/10 data-[state=error]:text-fd-error"
            data-state={copyState}
          >
            {copyState === 'copied' ? (
              <Check className="size-3.5 shrink-0" />
            ) : (
              <Copy className="size-3.5 shrink-0 text-fd-muted-foreground" />
            )}
            <span className="truncate">
              {copyState === 'copied'
                ? m.actions_copied_raw_source()
                : copyState === 'error'
                  ? m.actions_copy_raw_source_failed()
                  : m.actions_copy_raw_source()}
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenFile}
              disabled={opening}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border bg-fd-secondary/50 px-2 py-1.5 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FileText className="size-3.5 text-fd-muted-foreground" />
              {opening ? m.actions_opening() : m.actions_open_mdx_file()}
            </button>
            <button
              type="button"
              onClick={onOpenFolder}
              disabled={opening}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border bg-fd-secondary/50 px-2 py-1.5 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FolderOpen className="size-3.5 text-fd-muted-foreground" />
              {m.actions_open_folder()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FileTreeNodeView({
  node,
  activePath,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename
}: {
  node: FileTreeNode
  activePath: string
  onOpenPath: (filePath: string) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
}): React.JSX.Element {
  if (node.type === 'separator') {
    return (
      <div className="px-2 pb-1 pt-3 text-xs font-medium text-fd-muted-foreground">
        {node.label}
      </div>
    )
  }

  if (node.type === 'link') {
    return (
      <a
        href={node.href}
        target={node.external ? '_blank' : undefined}
        rel={node.external ? 'noreferrer' : undefined}
        className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <ExternalLink className="size-4 shrink-0" />
        <span className="truncate">{node.label}</span>
      </a>
    )
  }

  if (node.type === 'file') {
    return (
      <FileTreeItem
        entry={node.entry}
        active={node.entry.path === activePath}
        onOpenPath={onOpenPath}
        onRenamePath={onRenamePath}
        renamingPath={renamingPath}
        onStartRename={onStartRename}
        onStopRename={onStopRename}
      />
    )
  }

  return (
    <FileTreeFolder
      node={node}
      activePath={activePath}
      onOpenPath={onOpenPath}
      onRenamePath={onRenamePath}
      renamingPath={renamingPath}
      onStartRename={onStartRename}
      onStopRename={onStopRename}
    />
  )
}

function FileTreeFolder({
  node,
  activePath,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename
}: {
  node: Extract<FileTreeNode, { type: 'folder' }>
  activePath: string
  onOpenPath: (filePath: string) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
}): React.JSX.Element {
  const active = nodeContainsPath(node, activePath)
  const depth = useFolderDepth()

  return (
    <SidebarFolder
      active={active}
      defaultOpen={node.defaultOpen ?? active}
      collapsible={node.collapsible}
    >
      <SidebarFolderTrigger
        className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:text-fd-foreground [&_svg]:size-4 [&_svg]:shrink-0"
        data-active={active}
        title={node.description ?? node.path}
        onDoubleClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onStartRename(node.absolutePath)
        }}
        onKeyDown={(event) => {
          if (event.key !== 'F2') return
          event.preventDefault()
          event.stopPropagation()
          onStartRename(node.absolutePath)
        }}
        style={{ paddingInlineStart: getItemOffset(depth) }}
      >
        <FolderOpen className="size-4 shrink-0" />
        {renamingPath === node.absolutePath ? (
          <RenameInput
            value={node.name}
            onRename={(nextName) => onRenamePath(node.absolutePath, nextName)}
            onCancel={onStopRename}
          />
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </SidebarFolderTrigger>
      <SidebarFolderContent className="relative flex flex-col gap-0.5 pt-0.5 before:absolute before:inset-y-1 before:inset-s-2.5 before:w-px before:bg-fd-border before:content-['']">
        {node.children.map((child, index) => (
          <FileTreeNodeView
            key={getTreeNodeKey(child, index)}
            node={child}
            activePath={activePath}
            onOpenPath={onOpenPath}
            onRenamePath={onRenamePath}
            renamingPath={renamingPath}
            onStartRename={onStartRename}
            onStopRename={onStopRename}
          />
        ))}
      </SidebarFolderContent>
    </SidebarFolder>
  )
}

function FileTreeItem({
  entry,
  active,
  onOpenPath,
  onRenamePath,
  renamingPath,
  onStartRename,
  onStopRename
}: {
  entry: MdxFolderEntry
  active: boolean
  onOpenPath: (filePath: string) => void
  onRenamePath: (targetPath: string, nextName: string) => Promise<void>
  renamingPath: string | null
  onStartRename: (path: string) => void
  onStopRename: () => void
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
        if (renamingPath === entry.path) return
        onOpenPath(entry.path)
      }}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onStartRename(entry.path)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'F2') return
        event.preventDefault()
        event.stopPropagation()
        onStartRename(entry.path)
      }}
      className="relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-fd-primary data-[active=true]:before:content-[''] [&_svg]:size-4 [&_svg]:shrink-0"
      style={{ paddingInlineStart: getItemOffset(depth) }}
    >
      {renamingPath === entry.path ? (
        <RenameInput
          value={entry.name}
          onRename={(nextName) => onRenamePath(entry.path, nextName)}
          onCancel={onStopRename}
        />
      ) : (
        <span className="truncate">{entry.title ?? getDisplayName(entry)}</span>
      )}
    </SidebarItem>
  )
}

function RenameInput({
  value,
  onRename,
  onCancel
}: {
  value: string
  onRename: (nextName: string) => Promise<void>
  onCancel: () => void
}): React.JSX.Element {
  const [nextName, setNextName] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setNextName(value), [value])

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  async function submit(): Promise<void> {
    const trimmed = nextName.trim()
    if (!trimmed || trimmed === value) {
      onCancel()
      return
    }

    await onRename(trimmed)
    onCancel()
  }

  return (
    <input
      ref={inputRef}
      value={nextName}
      aria-label={m.preview_rename_item()}
      placeholder={m.preview_rename_placeholder()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onChange={(event) => setNextName(event.target.value)}
      onBlur={() => void submit()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Enter') void submit()
        if (event.key === 'Escape') onCancel()
      }}
      className="min-w-0 flex-1 rounded border bg-fd-background px-1.5 py-0.5 text-sm text-fd-foreground outline-none ring-fd-primary focus:ring-1"
    />
  )
}

function buildFileTree(entries: MdxFolderEntry[], pageTree?: MdxFolderTreeNode[]): FileTreeNode[] {
  if (pageTree && pageTree.length > 0) return buildFileTreeFromPageTree(entries, pageTree)

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
        folder = { type: 'folder', name: part, path: currentPath, absolutePath: '', children: [] }
        current.push(folder)
      }

      current = folder.children
    }
  }

  return sortTree(root)
}

function buildFileTreeFromPageTree(
  entries: MdxFolderEntry[],
  pageTree: MdxFolderTreeNode[]
): FileTreeNode[] {
  const filesByPath = new Map(entries.map((entry) => [entry.path, entry]))

  return pageTree
    .map((node): FileTreeNode | null => {
      if (node.type === 'separator') return node
      if (node.type === 'link') return node

      if (node.type === 'file') {
        const entry = filesByPath.get(node.path)
        return entry ? { type: 'file', entry } : null
      }

      return {
        type: 'folder',
        name: node.name,
        path: node.path,
        absolutePath: node.absolutePath,
        description: node.description,
        icon: node.icon,
        root: node.root,
        defaultOpen: node.defaultOpen,
        collapsible: node.collapsible,
        children: buildFileTreeFromPageTree(entries, node.children)
      }
    })
    .filter((node): node is FileTreeNode => node !== null)
}

function SearchResultItem({
  entry,
  active,
  onOpenPath
}: {
  entry: MdxFolderEntry
  active: boolean
  onOpenPath: (filePath: string) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={entry.relativePath}
      onClick={() => onOpenPath(entry.path)}
      className="relative flex w-full flex-col rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
      data-active={active}
    >
      <span className="truncate text-sm font-medium">{entry.title ?? getDisplayName(entry)}</span>
      <span className="mt-0.5 truncate text-xs opacity-70">
        {entry.displayPath || entry.relativePath}
      </span>
    </button>
  )
}

function buildDocumentLinkMap(
  entry: MdxFolderEntry | undefined
): Map<string, MdxFolderEntry['links'][number]> {
  const links = new Map<string, MdxFolderEntry['links'][number]>()

  for (const link of entry?.links ?? []) {
    links.set(normalizeDocumentHref(link.href), link)
  }

  return links
}

function normalizeDocumentHref(href: string): string {
  const trimmed = href.trim()
  const hashIndex = trimmed.indexOf('#')
  const beforeHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex)
  const queryIndex = beforeHash.indexOf('?')
  const withoutSuffix = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)

  try {
    return decodeURIComponent(withoutSuffix)
  } catch {
    return withoutSuffix
  }
}

function shouldUseNativeLinkClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return getTreeNodeSortName(a).localeCompare(getTreeNodeSortName(b))
  })
}

function nodeContainsPath(node: FileTreeNode, activePath: string): boolean {
  if (node.type === 'file') return node.entry.path === activePath
  if (node.type !== 'folder') return false
  return node.children.some((child) => nodeContainsPath(child, activePath))
}

function getTreeNodeKey(node: FileTreeNode, index: number): string {
  if (node.type === 'file') return `file:${node.entry.path}`
  if (node.type === 'folder') return `folder:${node.path}`
  if (node.type === 'link') return `link:${node.href}:${index}`
  return `separator:${node.label}:${index}`
}

function getTreeNodeSortName(node: FileTreeNode): string {
  if (node.type === 'file') return getDisplayName(node.entry)
  if (node.type === 'folder') return node.name
  if (node.type === 'link') return node.label
  return node.label
}

function getItemOffset(depth: number): string {
  return `calc(${2 + 3 * depth} * var(--spacing))`
}

function getDisplayName(entry: MdxFolderEntry): string {
  const path = entry.displayPath ?? entry.relativePath
  const name = path.split('/').filter(Boolean).at(-1)
  if (name) return name

  return entry.name
}
