import type { TOCItemType } from 'fumadocs-core/toc'
import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { Check, Code2, Copy, FileText, FolderOpen, Link2 } from 'lucide-react'
import type { MDXComponents } from 'mdx/types'
import { Component, useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { toast } from 'sonner'
import { m } from '../paraglide/messages'
import type { MdxDocumentBacklink, MdxFileKind, MdxFolderEntry, MdxWorkspace } from '../types'
import { MdxDocsLayout, MdxPageContainer } from './MdxDocsLayout'
import { getMDXComponents } from './mdx'
import {
  buildDocumentLinkMap,
  normalizeDocumentHref,
  shouldUseNativeLinkClick
} from './preview/document-links'
import {
  type ExtensionModule,
  loadExtensionStyle,
  parseExtensionLoadPackages,
  serializeExtensionLoadPackages
} from './preview/extensions'
import { FileTreeNodeContextMenu } from './preview/FileTreeNodeContextMenu'
import { PreviewSidebar } from './preview/WorkspaceSidebar'

interface MdxPreviewProps {
  workspace: MdxWorkspace
  onOpenFile: () => void
  onOpenFolder: () => void
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  onRenamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  onDeletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
  opening: boolean
}

type MdxModule = {
  default: React.ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>
  toc?: TOCItemType[]
}

type MdxRenderBoundaryProps = {
  children: React.ReactNode
  sourceKey: string
  onError: (message: string | null) => void
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

  componentDidUpdate(previousProps: MdxRenderBoundaryProps): void {
    if (previousProps.sourceKey !== this.props.sourceKey) this.props.onError(null)
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
  onDeletePath,
  opening
}: MdxPreviewProps): React.JSX.Element {
  const file = workspace.file
  const isMarkdownDocument = file.kind === 'markdown'
  const extensionPackages = workspace.extensions?.packages ?? []
  const extensionWarnings = workspace.extensions?.warnings ?? []
  const extensionPackageSnapshot = serializeExtensionLoadPackages(extensionPackages)
  const extensionWorkspaceKey = workspace.extensions?.workspaceRoot ?? file.path
  const extensionTrustKey = `${extensionWorkspaceKey}\n${extensionPackageSnapshot}`
  const [trustedExtensionKey, setTrustedExtensionKey] = useState<string | null>(null)
  const [extensionComponents, setExtensionComponents] = useState<MDXComponents>({})
  const [extensionError, setExtensionError] = useState<string | null>(null)
  const [module, setModule] = useState<MdxModule | null>(null)
  const [sourceCopyState, setSourceCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [pathCopyState, setPathCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [documentContextMenu, setDocumentContextMenu] = useState<{
    x: number
    y: number
    path: string
  } | null>(null)
  const [copiedFilePath, setCopiedFilePath] = useState(file.path)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const hasExtensionPackages = extensionPackages.length > 0
  const extensionsEnabled = hasExtensionPackages && trustedExtensionKey === extensionTrustKey
  const extensionComponentsKey = Object.keys(extensionComponents).sort().join('|')
  const renderSourceKey = `${file.compiledSource}\n${extensionsEnabled ? extensionComponentsKey : 'safe'}`
  const title = typeof file.frontmatter.title === 'string' ? file.frontmatter.title : file.name
  const description =
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : null
  const currentEntry = useMemo(
    () => workspace.folder?.files.find((entry) => entry.path === file.path),
    [file.path, workspace.folder]
  )
  const documentLinksByHref = useMemo(() => buildDocumentLinkMap(currentEntry), [currentEntry])
  const mdxComponents = useMemo(
    () =>
      getMDXComponents({
        ...(extensionsEnabled ? extensionComponents : {}),
        a: (props) => (
          <DocumentLink
            {...props}
            linksByHref={documentLinksByHref}
            workspaceRoot={workspace.folder?.rootPath}
            onOpenPath={onOpenPath}
          />
        )
      }),
    [
      documentLinksByHref,
      extensionsEnabled,
      extensionComponents,
      onOpenPath,
      workspace.folder?.rootPath
    ]
  )

  useEffect(() => {
    let canceled = false

    async function loadExtensions(): Promise<void> {
      setExtensionComponents({})
      setExtensionError(null)
      const packages = parseExtensionLoadPackages(extensionPackageSnapshot)

      if (!extensionsEnabled || packages.length === 0) {
        void window.api.setWorkspaceExtensionsEnabled(false)
        return
      }

      try {
        const enabled = await window.api.setWorkspaceExtensionsEnabled(true, extensionTrustKey)
        if (!enabled) throw new Error('Workspace extension trust no longer matches.')

        for (const style of packages.flatMap((item) => item.styles)) {
          loadExtensionStyle(style.url)
        }

        const loadedComponents: MDXComponents = {}
        for (const extensionPackage of packages) {
          const extensionModule = (await import(
            /* @vite-ignore */ extensionPackage.entryUrl
          )) as ExtensionModule
          const extensionDefinition =
            typeof extensionModule.default === 'function'
              ? extensionModule.default(runtime)
              : extensionModule.default
          Object.assign(
            loadedComponents,
            extensionModule.components ?? extensionDefinition?.components ?? {}
          )
        }

        if (!canceled) setExtensionComponents(loadedComponents)
      } catch (cause) {
        if (!canceled) {
          setExtensionComponents({})
          setExtensionError(cause instanceof Error ? cause.message : String(cause))
        }
      }
    }

    void loadExtensions()

    return () => {
      canceled = true
    }
  }, [extensionsEnabled, extensionPackageSnapshot, extensionTrustKey])

  useEffect(() => {
    let canceled = false

    async function compileMdx(): Promise<void> {
      setModule(null)
      setCompileError(file.compileError ?? null)
      setRenderError(null)

      if (file.compileError || !isMarkdownDocument) return

      try {
        const fn = new Function(file.compiledSource)
        const nextModule = fn(runtime) as MdxModule

        if (!canceled) setModule(nextModule)
      } catch (cause) {
        if (!canceled) setCompileError(cause instanceof Error ? cause.message : String(cause))
      }
    }

    void compileMdx()

    return () => {
      canceled = true
    }
  }, [file.compiledSource, file.compileError, isMarkdownDocument])

  if (copiedFilePath !== file.path) {
    setCopiedFilePath(file.path)
    setSourceCopyState('idle')
    setPathCopyState('idle')
  }

  useEffect(() => {
    if (sourceCopyState === 'idle' && pathCopyState === 'idle') return

    const timer = window.setTimeout(() => {
      setSourceCopyState('idle')
      setPathCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [sourceCopyState, pathCopyState])

  useEffect(() => {
    if (!documentContextMenu) return
    const close = (): void => setDocumentContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', close)
    }
  }, [documentContextMenu])

  async function copyRawSource(): Promise<void> {
    try {
      await window.api.copyMdxRawSource(file.path)
      setSourceCopyState('copied')
      toast.success(m.actions_copied_raw_source())
    } catch {
      setSourceCopyState('error')
      toast.error(m.actions_copy_raw_source_failed())
    }
  }

  async function copyDocumentPath(): Promise<void> {
    setDocumentContextMenu(null)
    try {
      await window.api.copyPath(file.path)
      setPathCopyState('copied')
      toast.success(m.preview_file_path_copied())
    } catch {
      setPathCopyState('error')
      toast.error(m.preview_file_path_copy_failed())
    }
  }

  async function showDocumentInFolder(): Promise<void> {
    setDocumentContextMenu(null)
    await window.api.showInFolder(file.path)
  }

  async function openDocumentInVsCode(): Promise<void> {
    setDocumentContextMenu(null)
    await window.api.openInVsCode(file.path)
  }

  function openDocumentContextMenu(event: React.MouseEvent): void {
    event.preventDefault()
    setDocumentContextMenu({ x: event.clientX, y: event.clientY, path: file.path })
  }

  const Mdx = module?.default
  const toc = module?.toc?.filter((item) => item.depth > 1) ?? []

  return (
    <MdxDocsLayout
      toc={toc}
      sidebar={
        workspace.folder
          ? ({ collapsed, collapseSidebar, expandSidebar }) => (
              <PreviewSidebar
                workspace={workspace}
                onOpenFile={onOpenFile}
                onOpenFolder={onOpenFolder}
                onOpenPath={onOpenPath}
                onRenamePath={onRenamePath}
                onDeletePath={onDeletePath}
                opening={opening}
                collapsed={collapsed}
                onCollapseSidebar={collapseSidebar}
                onExpandSidebar={expandSidebar}
              />
            )
          : undefined
      }
    >
      <MdxPageContainer onContextMenu={openDocumentContextMenu}>
        <DocsTitle>{title}</DocsTitle>
        {description ? <DocsDescription>{description}</DocsDescription> : null}
        <PageActions
          sourceCopyState={sourceCopyState}
          pathCopyState={pathCopyState}
          onCopyRawSource={() => void copyRawSource()}
          onCopyDocumentPath={() => void copyDocumentPath()}
        />

        {isMarkdownDocument && (hasExtensionPackages || extensionWarnings.length > 0) ? (
          <ExtensionSafetyNotice
            enabled={extensionsEnabled}
            packages={extensionPackages}
            warnings={extensionWarnings}
            error={extensionError}
            onEnable={() => setTrustedExtensionKey(extensionTrustKey)}
            onDisable={() => setTrustedExtensionKey(null)}
          />
        ) : null}

        {isMarkdownDocument && (compileError || renderError) ? (
          <pre className="overflow-auto rounded-md border bg-fd-error/10 p-4 text-sm text-fd-error">
            {compileError ?? renderError}
          </pre>
        ) : null}

        {isMarkdownDocument && Mdx && !compileError ? (
          <MdxRenderBoundary sourceKey={renderSourceKey} onError={setRenderError}>
            <DocsBody className="mdxforge-mdx max-w-none text-fd-foreground/90 dark:prose-invert">
              <Mdx components={mdxComponents} />
            </DocsBody>
          </MdxRenderBoundary>
        ) : null}

        {!isMarkdownDocument ? <UnsupportedDocumentPlaceholder kind={file.kind} /> : null}

        {currentEntry && currentEntry.backlinks.length > 0 ? (
          <Backlinks
            backlinks={currentEntry.backlinks}
            onOpenPath={(filePath) => onOpenPath(filePath, workspace.folder?.rootPath)}
          />
        ) : null}
        <FileTreeNodeContextMenu
          menu={documentContextMenu}
          items={[
            {
              label: m.actions_copy_raw_source(),
              icon: <FileText className="size-4 text-fd-primary" />,
              onSelect: () => {
                setDocumentContextMenu(null)
                void copyRawSource()
              }
            },
            {
              label: m.preview_show_in_folder(),
              icon: <FolderOpen className="size-4 text-fd-primary" />,
              onSelect: () => void showDocumentInFolder()
            },
            {
              label: m.preview_open_in_vscode(),
              icon: <Code2 className="size-4 text-fd-primary" />,
              onSelect: () => void openDocumentInVsCode()
            },
            {
              label: m.preview_copy_file_path(),
              icon: <Copy className="size-4 text-fd-primary" />,
              onSelect: () => void copyDocumentPath()
            }
          ]}
        />
      </MdxPageContainer>
    </MdxDocsLayout>
  )
}

function UnsupportedDocumentPlaceholder({ kind }: { kind: MdxFileKind }): React.JSX.Element {
  return (
    <section className="rounded-xl border bg-fd-card p-6 text-sm">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 shrink-0 text-fd-primary" />
        <div className="min-w-0">
          <h2 className="font-medium text-fd-foreground">
            {m.preview_unsupported_document_title()}
          </h2>
          <p className="mt-1 text-fd-muted-foreground">
            {m.preview_unsupported_document_description({ kind: kindLabel(kind) })}
          </p>
          <p className="mt-3 text-xs text-fd-muted-foreground">
            {m.preview_unsupported_document_hint()}
          </p>
        </div>
      </div>
    </section>
  )
}

function kindLabel(kind: MdxFileKind): string {
  if (kind === 'html') return 'HTML'
  if (kind === 'pdf') return 'PDF'
  if (kind === 'markdown') return 'MDX/Markdown'
  return kind
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

function PageActions({
  sourceCopyState,
  pathCopyState,
  onCopyRawSource,
  onCopyDocumentPath
}: {
  sourceCopyState: 'idle' | 'copied' | 'error'
  pathCopyState: 'idle' | 'copied' | 'error'
  onCopyRawSource: () => void
  onCopyDocumentPath: () => void
}): React.JSX.Element {
  return (
    <div className="flex flex-row items-center gap-2 border-b pb-5 pt-0">
      <button
        type="button"
        onClick={onCopyRawSource}
        aria-label={m.actions_copy_raw_source()}
        className={buttonVariants({
          color: 'secondary',
          size: 'sm',
          className:
            'gap-2 data-[state=copied]:border-fd-primary/40 data-[state=copied]:bg-fd-primary/10 data-[state=copied]:text-fd-primary data-[state=error]:border-fd-error/40 data-[state=error]:bg-fd-error/10 data-[state=error]:text-fd-error [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground'
        })}
        data-state={sourceCopyState}
      >
        {sourceCopyState === 'copied' ? <Check /> : <Copy />}
        {sourceCopyState === 'copied'
          ? m.actions_copied_raw_source()
          : sourceCopyState === 'error'
            ? m.actions_copy_raw_source_failed()
            : m.actions_copy_raw_source()}
      </button>
      <button
        type="button"
        onClick={onCopyDocumentPath}
        aria-label={m.preview_copy_file_path()}
        className={buttonVariants({
          color: 'secondary',
          size: 'sm',
          className:
            'gap-2 data-[state=copied]:border-fd-primary/40 data-[state=copied]:bg-fd-primary/10 data-[state=copied]:text-fd-primary data-[state=error]:border-fd-error/40 data-[state=error]:bg-fd-error/10 data-[state=error]:text-fd-error [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground'
        })}
        data-state={pathCopyState}
      >
        {pathCopyState === 'copied' ? <Check /> : <Copy />}
        {pathCopyState === 'copied'
          ? m.preview_file_path_copied()
          : pathCopyState === 'error'
            ? m.preview_file_path_copy_failed()
            : m.preview_copy_file_path()}
      </button>
    </div>
  )
}

function ExtensionSafetyNotice({
  enabled,
  packages,
  warnings,
  error,
  onEnable,
  onDisable
}: {
  enabled: boolean
  packages: NonNullable<MdxWorkspace['extensions']>['packages']
  warnings: NonNullable<MdxWorkspace['extensions']>['warnings']
  error: string | null
  onEnable: () => void
  onDisable: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border bg-fd-card p-4 text-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {enabled ? m.extensions_trusted_mode_title() : m.extensions_safe_mode_title()}
          </p>
          <p className="mt-1 text-fd-muted-foreground">
            {enabled
              ? m.extensions_trusted_mode_description()
              : m.extensions_safe_mode_description()}
          </p>
        </div>
        {packages.length > 0 ? (
          <button
            type="button"
            onClick={enabled ? onDisable : onEnable}
            className="rounded-md border bg-fd-background px-3 py-2 font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            {enabled ? m.extensions_disable() : m.extensions_enable_workspace()}
          </button>
        ) : null}
      </div>

      {packages.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {packages.map((extensionPackage) => (
            <span
              key={`${extensionPackage.name}@${extensionPackage.version}`}
              className="rounded-md border bg-fd-secondary/50 px-2 py-1 text-xs text-fd-muted-foreground"
            >
              {extensionPackage.name}@{extensionPackage.version}
            </span>
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="mt-3 grid gap-1 text-xs text-fd-muted-foreground">
          {warnings.map((warning) => (
            <li key={`${warning.source}:${warning.reason}`}>
              {warning.source}: {warning.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <pre className="mt-3 overflow-auto rounded-md border bg-fd-error/10 p-3 text-xs text-fd-error">
          {error}
        </pre>
      ) : null}
    </section>
  )
}
