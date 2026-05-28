import type { MDXComponents } from 'mdx/types'
import { useMemo } from 'react'
import type { MdxFolderEntry } from '../../types'
import { getMDXComponents } from '../mdx'
import { DocumentLink } from './DocumentLink'
import { buildDocumentLinkMap } from './document-links'

export function useMdxRenderComponents({
  currentEntry,
  extensionComponents,
  extensionsEnabled,
  workspaceRoot,
  onOpenPath
}: {
  currentEntry?: MdxFolderEntry
  extensionComponents: MDXComponents
  extensionsEnabled: boolean
  workspaceRoot?: string
  onOpenPath: (filePath: string, workspaceRoot?: string) => void
}): ReturnType<typeof getMDXComponents> {
  const documentLinksByHref = useMemo(() => buildDocumentLinkMap(currentEntry), [currentEntry])

  return useMemo(
    () =>
      getMDXComponents({
        ...(extensionsEnabled ? extensionComponents : {}),
        a: (props) => (
          <DocumentLink
            {...props}
            linksByHref={documentLinksByHref}
            workspaceRoot={workspaceRoot}
            onOpenPath={onOpenPath}
          />
        )
      }),
    [documentLinksByHref, extensionsEnabled, extensionComponents, onOpenPath, workspaceRoot]
  )
}
