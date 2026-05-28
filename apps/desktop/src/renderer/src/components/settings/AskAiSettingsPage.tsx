import { Bot } from 'lucide-react'
import { m } from '../../paraglide/messages'
import type { AskAiButtonAction } from '../../types'

export function AskAiSettingsPage({
  action,
  onActionChange
}: {
  action: AskAiButtonAction
  onActionChange: (action: AskAiButtonAction) => void
}): React.JSX.Element {
  return (
    <section className="grid gap-4 rounded-xl border bg-fd-card p-4">
      <div>
        <div className="flex items-center gap-2 font-medium">
          <Bot className="size-4" />
          {m.settings_ask_ai_button_title()}
        </div>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          {m.settings_ask_ai_button_description()}
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-fd-background p-3 text-sm">
        <input
          type="radio"
          checked={action === 'open-sidebar'}
          onChange={() => onActionChange('open-sidebar')}
          className="mt-1"
        />
        <span>
          <span className="block font-medium">{m.settings_ask_ai_action_open_sidebar()}</span>
          <span className="mt-1 block text-fd-muted-foreground">
            {m.settings_ask_ai_action_open_sidebar_description()}
          </span>
        </span>
      </label>
    </section>
  )
}
