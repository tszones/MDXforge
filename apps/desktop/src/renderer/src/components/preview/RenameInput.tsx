import { useEffect, useRef, useState } from 'react'
import { m } from '../../paraglide/messages'

export function RenameInput({
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
    const input = inputRef.current
    if (!input) return

    input.focus()

    const extensionStart = getExtensionStart(value)
    input.setSelectionRange(0, extensionStart)
  }, [value])

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

function getExtensionStart(fileName: string): number {
  const extensionStart = fileName.lastIndexOf('.')
  if (extensionStart <= 0) return fileName.length
  return extensionStart
}
