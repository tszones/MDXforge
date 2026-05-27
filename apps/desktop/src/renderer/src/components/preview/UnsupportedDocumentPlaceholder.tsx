import { FileText } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { MdxFileKind } from '../../types'

export function UnsupportedDocumentPlaceholder({ kind }: { kind: MdxFileKind }): React.JSX.Element {
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
