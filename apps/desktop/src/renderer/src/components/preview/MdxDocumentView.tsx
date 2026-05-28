import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { Code2, Copy, FileText, FolderOpen } from 'lucide-react'
import { useMemo } from 'react'
import { m } from '../../paraglide/messages'
import type { MdxFile, MdxWorkspace } from '../../types'
import { Backlinks } from './Backlinks'
import { DocumentTocRail } from './DocumentTocRail'
import { ExtensionSafetyNotice } from './ExtensionSafetyNotice'
import { FileTreeNodeContextMenu } from './FileTreeNodeContextMenu'
import { MdxRenderBoundary } from './MdxRenderBoundary'
import { PageActions } from './PageActions'
import { UnsupportedDocumentPlaceholder } from './UnsupportedDocumentPlaceholder'
import { useCompiledMdxModule } from './useCompiledMdxModule'
import { useDocumentContextMenu } from './useDocumentContextMenu'
import { useDocumentCopyActions } from './useDocumentCopyActions'
import { useMdxRenderComponents } from './useMdxRenderComponents'
import { useWorkspaceExtensions } from './useWorkspaceExtensions'

export function MdxDocumentView({
  workspace,
  file,
  onOpenPath,
  tocPinned,
  onTocPinnedChange
}: {
  workspace: MdxWorkspace
  file: MdxFile
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
  tocPinned: boolean
  onTocPinnedChange: (pinned: boolean) => void
}): React.JSX.Element {
  const isMarkdownDocument = file.kind === 'markdown'
  const { sourceCopyState, pathCopyState, copyRawSource, copyDocumentPath } =
    useDocumentCopyActions(file.path)
  const {
    documentContextMenu,
    closeDocumentContextMenu,
    openDocumentContextMenu,
    showDocumentInFolder,
    openDocumentInVsCode
  } = useDocumentContextMenu(file.path)
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
  const mdxComponents = useMdxRenderComponents({
    currentEntry,
    extensionComponents,
    extensionsEnabled,
    workspaceRoot: workspace.folder?.rootPath,
    onOpenPath
  })
  const Mdx = module?.default
  const toc = useMemo(() => module?.toc?.filter((item) => item.depth > 1) ?? [], [module?.toc])

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto">
        <article
          id="nd-page"
          className="mx-auto flex min-h-full w-full max-w-[900px] flex-col gap-4 px-4 py-6 md:px-6 md:pt-8 xl:px-8 xl:pt-10"
          onContextMenu={openDocumentContextMenu}
        >
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
                  closeDocumentContextMenu()
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
                onSelect: () => {
                  closeDocumentContextMenu()
                  void copyDocumentPath()
                }
              }
            ]}
          />
        </article>
      </div>
      <DocumentTocRail toc={toc} pinned={tocPinned} onPinnedChange={onTocPinnedChange} />
    </div>
  )
}
