import { Bot } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { MdxFile } from '../../types'

export function AiChatPanel({ file }: { file: MdxFile | null }): React.JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="rounded-lg border border-dashed p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <Bot className="size-4 text-fd-primary" />
          {m.workbench_ai_placeholder_title()}
        </div>
        <p className="text-fd-muted-foreground">{m.workbench_ai_placeholder_description()}</p>
      </div>
      {file ? (
        <div className="rounded-lg border bg-fd-secondary/40 p-3 text-xs">
          <div className="mb-1 font-medium text-fd-muted-foreground">
            {m.workbench_ai_active_document()}
          </div>
          <div className="truncate font-mono">{file.path}</div>
        </div>
      ) : null}
    </div>
  )
}
