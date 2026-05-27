import { FileText, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { m } from '../../paraglide/messages'
import { defaultViewableDocumentExtensions, normalizeDocumentExtension } from '../../types'

export function DocumentsSettingsPage({
  extensions,
  onExtensionsChange
}: {
  extensions: string[]
  onExtensionsChange: (extensions: string[]) => void
}): React.JSX.Element {
  const [draft, setDraft] = useState('')
  const normalizedDraft = normalizeDocumentExtension(draft)
  const canAdd = Boolean(normalizedDraft && !extensions.includes(normalizedDraft))

  function addExtension(): void {
    if (!normalizedDraft || extensions.includes(normalizedDraft)) return
    setDraft('')
    onExtensionsChange([...extensions, normalizedDraft].sort((a, b) => a.localeCompare(b)))
  }

  function removeExtension(extension: string): void {
    onExtensionsChange(extensions.filter((item) => item !== extension))
  }

  return (
    <section className="grid gap-4 rounded-xl border bg-fd-card p-4">
      <div>
        <div className="flex items-center gap-2 font-medium">
          <FileText className="size-4" />
          {m.settings_documents_extensions_title()}
        </div>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          {m.settings_documents_extensions_description()}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {extensions.map((extension) => (
          <span
            key={extension}
            className="inline-flex items-center gap-1 rounded-full border bg-fd-secondary/50 px-2.5 py-1 text-sm"
          >
            {extension}
            <button
              type="button"
              onClick={() => removeExtension(extension)}
              className="rounded-full p-0.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
              aria-label={m.settings_documents_remove_extension({ extension })}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex max-w-md gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            addExtension()
          }}
          placeholder={m.settings_documents_extension_placeholder()}
          className="min-w-0 flex-1 rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary/60"
        />
        <button
          type="button"
          onClick={addExtension}
          disabled={!canAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-50"
        >
          <Plus className="size-4" />
          {m.settings_documents_add_extension()}
        </button>
      </div>

      <button
        type="button"
        onClick={() => onExtensionsChange([...defaultViewableDocumentExtensions])}
        className="w-fit rounded-lg border px-3 py-2 text-sm text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        {m.settings_documents_reset_extensions()}
      </button>
    </section>
  )
}
