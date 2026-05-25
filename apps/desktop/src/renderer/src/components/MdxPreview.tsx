import { toast } from 'sonner'
import type { TOCItemType } from 'fumadocs-core/toc'
import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { Check, Copy, FileText, Link2 } from 'lucide-react'
import type { MDXComponents } from 'mdx/types'
import { Component, useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { m } from '../paraglide/messages'
import type { MdxDocumentBacklink, MdxFolderEntry, MdxWorkspace } from '../types'
import { MdxDocsLayout, MdxPageContainer } from './MdxDocsLayout'
import { FileTreeNodeContextMenu } from './preview/FileTreeNodeContextMenu'
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
import { PreviewSidebar } from './preview/WorkspaceSidebar'

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
  opening
}: MdxPreviewProps): React.JSX.Element {
  const file = workspace.file
  const extensionPackages = workspace.extensions?.packages ?? []
  const extensionWarnings = workspace.extensions?.warnings ?? []
  const extensionPackageSnapshot = serializeExtensionLoadPackages(extensionPackages)
  const extensionWorkspaceKey = workspace.extensions?.workspaceRoot ?? file.path
  const extensionTrustKey = `${extensionWorkspaceKey}\n${extensionPackageSnapshot}`
  const [trustedExtensionKey, setTrustedExtensionKey] = useState<string | null>(null)
  const [extensionComponents, setExtensionComponents] = useState<MDXComponents>({})
  const [extensionError, setExtensionError] = useState<string | null>(null)
  const [module, setModule] = useState<MdxModule | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
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
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : file.path
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

      if (file.compileError) return

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
  }, [file.compiledSource, file.compileError])

  if (copiedFilePath !== file.path) {
    setCopiedFilePath(file.path)
    setCopyState('idle')
  }

  useEffect(() => {
    if (copyState === 'idle') return

    const timer = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [copyState])

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
      setCopyState('copied')
      toast.success(m.actions_copied_raw_source())
    } catch {
      setCopyState('error')
      toast.error(m.actions_copy_raw_source_failed())
    }
  }

  async function copyDocumentPath(): Promise<void> {
    setDocumentContextMenu(null)
    try {
      await window.api.copyPath(file.path)
      toast.success(m.preview_file_path_copied())
    } catch {
      toast.error(m.preview_file_path_copy_failed())
    }
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
      <MdxPageContainer onContextMenu={openDocumentContextMenu}>
        <DocsTitle>{title}</DocsTitle>
        <DocsDescription>{description}</DocsDescription>
        <PageActions copyState={copyState} onCopyRawSource={() => void copyRawSource()} />

        {hasExtensionPackages || extensionWarnings.length > 0 ? (
          <ExtensionSafetyNotice
            enabled={extensionsEnabled}
            packages={extensionPackages}
            warnings={extensionWarnings}
            error={extensionError}
            onEnable={() => setTrustedExtensionKey(extensionTrustKey)}
            onDisable={() => setTrustedExtensionKey(null)}
          />
        ) : null}

        {compileError || renderError ? (
          <pre className="overflow-auto rounded-md border bg-fd-error/10 p-4 text-sm text-fd-error">
            {compileError ?? renderError}
          </pre>
        ) : null}

        {Mdx && !compileError ? (
          <MdxRenderBoundary sourceKey={renderSourceKey} onError={setRenderError}>
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
  copyState,
  onCopyRawSource
}: {
  copyState: 'idle' | 'copied' | 'error'
  onCopyRawSource: () => void
}): React.JSX.Element {
  return (
    <div className="flex flex-row items-center gap-2 border-b pb-6 pt-2">
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
        data-state={copyState}
      >
        {copyState === 'copied' ? <Check /> : <Copy />}
        {copyState === 'copied'
          ? m.actions_copied_raw_source()
          : copyState === 'error'
            ? m.actions_copy_raw_source_failed()
            : m.actions_copy_raw_source()}
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
