import { Link2 } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { MdxDocumentBacklink } from '../../types'

export function Backlinks({
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
