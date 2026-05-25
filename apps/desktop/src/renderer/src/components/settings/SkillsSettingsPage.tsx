import { Check, Copy, FolderPlus, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { m } from '../../paraglide/messages'
import type {
  AgentDetectionResult,
  AgentId,
  AgentInstallPreview,
  WorkspaceSkillsState
} from '../../types'

export function SkillsSettingsPage({
  workspaceRoot
}: {
  workspaceRoot?: string
}): React.JSX.Element {
  const [skillsState, setSkillsState] = useState<WorkspaceSkillsState | null>(null)
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<AgentDetectionResult[]>([])
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [preview, setPreview] = useState<AgentInstallPreview | null>(null)
  const [newSkillName, setNewSkillName] = useState('local-skill')
  const [newSkillType, setNewSkillType] = useState<'writing' | 'component' | 'template'>('writing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    void window.api
      .getWorkspaceSkills(workspaceRoot)
      .then(setSkillsState)
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false))
    void window.api
      .detectAgents()
      .then(setAgents)
      .catch(() => setAgents([]))
  }, [workspaceRoot])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1600)
    return () => window.clearTimeout(timer)
  }, [copyState])

  async function addLocalFolder(): Promise<void> {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    try {
      const nextState = await window.api.addLocalSkillFolder(workspaceRoot)
      if (nextState) setSkillsState(nextState)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function createLocalSkill(): Promise<void> {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    try {
      setSkillsState(await window.api.createLocalSkill(workspaceRoot, newSkillName, newSkillType))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function copyRules(): Promise<void> {
    if (!skillsState?.mergedRules) return
    try {
      await window.api.copySkillRules(skillsState.mergedRules)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  async function previewAgent(agentId: AgentId): Promise<void> {
    if (!workspaceRoot) return
    try {
      setPreview(await window.api.previewAgentInstall(workspaceRoot, agentId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  async function previewAgentDisable(agentId: AgentId): Promise<void> {
    if (!workspaceRoot) return
    try {
      setPreview(await window.api.previewAgentDisable(workspaceRoot, agentId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  async function applyAgent(agentId: AgentId): Promise<void> {
    if (!workspaceRoot) return
    try {
      setPreview(await window.api.applyAgentInstall(workspaceRoot, agentId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  async function disableAgent(agentId: AgentId): Promise<void> {
    if (!workspaceRoot) return
    try {
      setPreview(await window.api.applyAgentDisable(workspaceRoot, agentId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  if (!workspaceRoot) return <SkillsEmptyState />

  const activeCount = skillsState?.skills.filter((skill) => skill.status === 'active').length ?? 0

  return (
    <section className="grid gap-4">
      <div className="rounded-xl border bg-fd-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="size-4" />
              {m.skills_active_title()}
            </div>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {m.skills_workspace_root({ path: workspaceRoot })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void addLocalFolder()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-60"
          >
            <FolderPlus className="size-4" />
            {m.skills_add_local_folder()}
          </button>
        </div>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          {m.skills_active_count({ count: activeCount })}
        </p>
      </div>

      <CreateLocalSkillForm
        loading={loading}
        newSkillName={newSkillName}
        newSkillType={newSkillType}
        onNameChange={setNewSkillName}
        onTypeChange={setNewSkillType}
        onCreate={() => void createLocalSkill()}
      />

      {error ? (
        <pre className="overflow-auto rounded-lg border bg-fd-error/10 p-3 text-sm text-fd-error">
          {error}
        </pre>
      ) : null}

      <SkillsList skillsState={skillsState} loading={loading} />

      <AgentIntegrations
        agents={agents}
        preview={preview}
        onPreview={(agentId) => void previewAgent(agentId)}
        onPreviewDisable={(agentId) => void previewAgentDisable(agentId)}
        onApply={(agentId) => void applyAgent(agentId)}
        onDisable={(agentId) => void disableAgent(agentId)}
      />

      {preview ? <AgentDiffDialog preview={preview} onClose={() => setPreview(null)} /> : null}

      <section className="rounded-xl border bg-fd-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">{m.skills_ai_rules_title()}</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {m.skills_ai_rules_description()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyRules()}
            disabled={!skillsState?.mergedRules}
            data-state={copyState}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-60 data-[state=copied]:border-fd-primary/40 data-[state=copied]:text-fd-primary data-[state=error]:text-fd-error"
          >
            {copyState === 'copied' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copyState === 'copied'
              ? m.skills_rules_copied()
              : copyState === 'error'
                ? m.actions_copy_raw_source_failed()
                : m.skills_copy_rules()}
          </button>
        </div>
        <pre className="mt-4 max-h-80 overflow-auto rounded-lg border bg-fd-background p-3 text-xs text-fd-muted-foreground">
          {skillsState?.mergedRules || m.skills_no_rules()}
        </pre>
      </section>
    </section>
  )
}

function SkillsEmptyState(): React.JSX.Element {
  return (
    <section className="rounded-xl border bg-fd-card p-5">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="size-4" />
        {m.settings_skills_title()}
      </div>
      <p className="mt-2 text-sm text-fd-muted-foreground">{m.skills_open_workspace_empty()}</p>
    </section>
  )
}

function CreateLocalSkillForm({
  loading,
  newSkillName,
  newSkillType,
  onNameChange,
  onTypeChange,
  onCreate
}: {
  loading: boolean
  newSkillName: string
  newSkillType: 'writing' | 'component' | 'template'
  onNameChange: (value: string) => void
  onTypeChange: (value: 'writing' | 'component' | 'template') => void
  onCreate: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-xl border bg-fd-card p-4">
      <h2 className="font-medium">{m.skills_create_local_title()}</h2>
      <p className="mt-1 text-sm text-fd-muted-foreground">{m.skills_create_local_description()}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <input
          value={newSkillName}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="local-dashboard"
          className="rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary"
        />
        <select
          value={newSkillType}
          onChange={(event) =>
            onTypeChange(event.target.value as 'writing' | 'component' | 'template')
          }
          className="rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary"
        >
          <option value="writing">{m.skills_type_writing()}</option>
          <option value="component">{m.skills_type_component()}</option>
          <option value="template">{m.skills_type_template()}</option>
        </select>
        <button
          type="button"
          onClick={onCreate}
          disabled={loading || !newSkillName.trim()}
          className="rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
        >
          {m.skills_create_local()}
        </button>
      </div>
    </section>
  )
}

function AgentIntegrations({
  agents,
  preview,
  onPreview,
  onPreviewDisable,
  onApply,
  onDisable
}: {
  agents: AgentDetectionResult[]
  preview: AgentInstallPreview | null
  onPreview: (agentId: AgentId) => void
  onPreviewDisable: (agentId: AgentId) => void
  onApply: (agentId: AgentId) => void
  onDisable: (agentId: AgentId) => void
}): React.JSX.Element {
  return (
    <section className="rounded-xl border bg-fd-card p-4">
      <h2 className="font-medium">{m.skills_agents_title()}</h2>
      <p className="mt-1 text-sm text-fd-muted-foreground">{m.skills_agents_description()}</p>
      <div className="mt-4 grid gap-3">
        {agents.map((agent) => {
          const installReady =
            preview?.agentId === agent.id &&
            preview.operation === 'install' &&
            preview.action !== 'conflict'
          const disableReady =
            preview?.agentId === agent.id &&
            preview.operation === 'disable' &&
            preview.action !== 'conflict'

          return (
            <article key={agent.id} className="rounded-lg border bg-fd-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <p className="mt-1 text-xs text-fd-muted-foreground">
                    {agent.status === 'detected'
                      ? m.skills_agent_detected()
                      : agent.reason || m.skills_agent_not_detected()}
                  </p>
                </div>
                <span className="rounded-md border px-2 py-1 text-xs text-fd-muted-foreground">
                  {agent.integrationMode}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onPreview(agent.id)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent"
                >
                  {m.skills_preview_diff()}
                </button>
                {agent.integrationMode === 'managed-file' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onApply(agent.id)}
                      disabled={!installReady}
                      className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground disabled:opacity-50"
                    >
                      {m.skills_apply_rules()}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreviewDisable(agent.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent"
                    >
                      {m.skills_preview_disable()}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDisable(agent.id)}
                      disabled={!disableReady}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent disabled:opacity-50"
                    >
                      {m.skills_disable_rules()}
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AgentDiffDialog({
  preview,
  onClose
}: {
  preview: AgentInstallPreview
  onClose: () => void
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border bg-fd-popover text-fd-popover-foreground shadow-2xl">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <h3 className="font-medium">{m.skills_diff_dialog_title()}</h3>
            <p className="mt-1 truncate text-xs text-fd-muted-foreground">
              {preview.action} {preview.relativePath || preview.agentId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent"
          >
            {m.title_bar_close()}
          </button>
        </div>
        {preview.reason ? (
          <p className="border-b p-4 text-xs text-fd-error">{preview.reason}</p>
        ) : null}
        <pre className="max-h-[65vh] max-w-full overflow-auto whitespace-pre-wrap break-words p-4 text-xs">
          {preview.diff || preview.after || m.skills_no_rules()}
        </pre>
      </section>
    </div>
  )
}

function SkillsList({
  skillsState,
  loading
}: {
  skillsState: WorkspaceSkillsState | null
  loading: boolean
}): React.JSX.Element {
  return (
    <div className="grid gap-3">
      {skillsState?.skills.length ? (
        skillsState.skills.map((skill) => (
          <article key={skill.source} className="rounded-xl border bg-fd-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-medium">{skill.title}</h2>
                <p className="mt-1 text-xs text-fd-muted-foreground">
                  {skill.name}@{skill.version} · {skill.source}
                </p>
              </div>
              <span className="rounded-md border bg-fd-background px-2 py-1 text-xs text-fd-muted-foreground">
                {skill.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {skill.types.map((type) => (
                <span key={type} className="rounded-md bg-fd-secondary px-2 py-1 text-xs">
                  {type}
                </span>
              ))}
              {skill.components.map((component) => (
                <span key={component} className="rounded-md border px-2 py-1 text-xs">
                  {component}
                </span>
              ))}
            </div>
            {skill.permissions.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-fd-muted-foreground">
                {skill.permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            ) : null}
            {skill.reason ? <p className="mt-3 text-xs text-fd-error">{skill.reason}</p> : null}
          </article>
        ))
      ) : (
        <div className="rounded-xl border bg-fd-card p-4 text-sm text-fd-muted-foreground">
          {loading ? m.skills_loading() : m.skills_empty()}
        </div>
      )}
    </div>
  )
}
