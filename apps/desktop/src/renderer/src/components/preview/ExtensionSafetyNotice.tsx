import { m } from '../../paraglide/messages'
import type { MdxWorkspace } from '../../types'

export function ExtensionSafetyNotice({
  enabled,
  packages,
  warnings,
  error,
  onEnable,
  onDisable
}: {
  enabled: boolean
  packages: NonNullable<MdxWorkspace['extensions']>['packages']
  warnings: NonNullable<MdxWorkspace['extensions']>['warnings']
  error: string | null
  onEnable: () => void
  onDisable: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border bg-fd-card p-4 text-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {enabled ? m.extensions_trusted_mode_title() : m.extensions_safe_mode_title()}
          </p>
          <p className="mt-1 text-fd-muted-foreground">
            {enabled
              ? m.extensions_trusted_mode_description()
              : m.extensions_safe_mode_description()}
          </p>
        </div>
        {packages.length > 0 ? (
          <button
            type="button"
            onClick={enabled ? onDisable : onEnable}
            className="rounded-md border bg-fd-background px-3 py-2 font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            {enabled ? m.extensions_disable() : m.extensions_enable_workspace()}
          </button>
        ) : null}
      </div>

      {packages.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {packages.map((extensionPackage) => (
            <span
              key={`${extensionPackage.name}@${extensionPackage.version}`}
              className="rounded-md border bg-fd-secondary/50 px-2 py-1 text-xs text-fd-muted-foreground"
            >
              {extensionPackage.name}@{extensionPackage.version}
            </span>
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="mt-3 grid gap-1 text-xs text-fd-muted-foreground">
          {warnings.map((warning) => (
            <li key={`${warning.source}:${warning.reason}`}>
              {warning.source}: {warning.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <pre className="mt-3 overflow-auto rounded-md border bg-fd-error/10 p-3 text-xs text-fd-error">
          {error}
        </pre>
      ) : null}
    </section>
  )
}
