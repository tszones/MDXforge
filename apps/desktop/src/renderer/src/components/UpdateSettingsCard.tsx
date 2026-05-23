import { CheckCircle2, Download, RefreshCw, Rocket, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { m } from '../paraglide/messages'
import type { UpdateState } from '../types'

export function UpdateSettingsCard(): React.JSX.Element {
  const [state, setState] = useState<UpdateState>({ status: 'idle', version: '' })
  const busy = state.status === 'checking' || state.status === 'downloading'

  useEffect(() => {
    void window.api.getUpdateState().then(setState)
    return window.api.onUpdateState(setState)
  }, [])

  async function check(): Promise<void> {
    setState(await window.api.checkForUpdates())
  }

  return (
    <section className="grid gap-3 rounded-lg border bg-fd-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Rocket className="size-4" />
            {m.settings_updates_title()}
          </div>
          <p className="mt-1 text-sm text-fd-muted-foreground">
            {m.settings_updates_description()}
          </p>
        </div>
        <span className="w-fit rounded-md border bg-fd-background px-2 py-1 text-xs text-fd-muted-foreground">
          {m.settings_updates_current_version({ version: state.version || '-' })}
        </span>
      </div>

      <div className="rounded-md border bg-fd-background p-3 text-sm">
        <UpdateStatus state={state} />
        {state.status === 'downloading' ? (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-fd-muted">
            <div
              className="h-full rounded-full bg-fd-primary transition-all"
              style={{ width: `${state.percent ?? 0}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void check()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${busy ? 'animate-spin' : ''}`} />
          {m.settings_updates_check()}
        </button>
        {state.status === 'downloaded' ? (
          <button
            type="button"
            onClick={() => void window.api.quitAndInstallUpdate()}
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground"
          >
            <Download className="size-4" />
            {m.settings_updates_restart()}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function UpdateStatus({ state }: { state: UpdateState }): React.JSX.Element {
  if (state.status === 'checking')
    return <Status icon="spin" text={m.settings_updates_checking()} />
  if (state.status === 'available') {
    return (
      <Status icon="download" text={m.settings_updates_available({ version: version(state) })} />
    )
  }
  if (state.status === 'downloading') {
    return (
      <Status
        icon="download"
        text={m.settings_updates_downloading({ percent: state.percent ?? 0 })}
      />
    )
  }
  if (state.status === 'downloaded') {
    return <Status icon="check" text={m.settings_updates_downloaded({ version: version(state) })} />
  }
  if (state.status === 'not-available')
    return <Status icon="check" text={m.settings_updates_latest()} />
  if (state.status === 'error') {
    return (
      <Status icon="error" text={m.settings_updates_error({ message: state.message ?? '-' })} />
    )
  }
  return <Status icon="check" text={m.settings_updates_idle()} />
}

function version(state: UpdateState): string {
  return state.availableVersion ?? state.version ?? '-'
}

function Status({ icon, text }: { icon: 'check' | 'download' | 'error' | 'spin'; text: string }) {
  const className = 'mt-0.5 size-4 shrink-0'
  const Icon =
    icon === 'error'
      ? TriangleAlert
      : icon === 'download'
        ? Download
        : icon === 'spin'
          ? RefreshCw
          : CheckCircle2

  return (
    <div className="flex items-start gap-2 text-fd-muted-foreground">
      <Icon className={`${className} ${icon === 'spin' ? 'animate-spin' : ''}`} />
      <span>{text}</span>
    </div>
  )
}
