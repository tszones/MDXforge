import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { Code2, Copy, FileText, FolderOpen } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { m } from '../paraglide/messages'
import type { MdxWorkspace } from '../types'
import { MdxDocsLayout, MdxPageContainer } from './MdxDocsLayout'
import { getMDXComponents } from './mdx'
import { Backlinks } from './preview/Backlinks'
import { buildDocumentLinkMap } from './preview/document-links'
import { DocumentLink } from './preview/DocumentLink'
import { ExtensionSafetyNotice } from './preview/ExtensionSafetyNotice'
import { FileTreeNodeContextMenu } from './preview/FileTreeNodeContextMenu'
import { MdxRenderBoundary } from './preview/MdxRenderBoundary'
import { PageActions } from './preview/PageActions'
import { UnsupportedDocumentPlaceholder } from './preview/UnsupportedDocumentPlaceholder'
import { useCompiledMdxModule } from './preview/useCompiledMdxModule'
import { useWorkspaceExtensions } from './preview/useWorkspaceExtensions'
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
  const [sourceCopyState, setSourceCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [pathCopyState, setPathCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [documentContextMenu, setDocumentContextMenu] = useState<{
    x: number
    y: number
    path: string
  } | null>(null)
  const [copiedFilePath, setCopiedFilePath] = useState(file.path)
  const {
    extensionComponents,
    extensionComponentsKey,
    extensionError,
    extensionPackages,
    extensionWarnings,
    extensionsEnabled,
    hasExtensionPackages,
    enableExtensions,
    disableExtensions
  } = useWorkspaceExtensions({ workspace, fallbackPath: file.path })
  const { module, compileError, renderError, setRenderError } = useCompiledMdxModule({
    compiledSource: file.compiledSource,
    compileError: file.compileError,
    isMarkdownDocument
  })
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
            onEnable={enableExtensions}
            onDisable={disableExtensions}
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
