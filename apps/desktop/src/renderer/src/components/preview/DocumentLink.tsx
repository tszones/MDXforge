import type { MdxFolderEntry } from '../../types'
import { normalizeDocumentHref, shouldUseNativeLinkClick } from './document-links'

export function DocumentLink({
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
