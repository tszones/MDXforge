import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import claudeCodeIcon from '../../assets/agent-icons/claude-code.ico'
import codexIcon from '../../assets/agent-icons/codex.ico'
import cursorIcon from '../../assets/agent-icons/cursor.ico'
import { m } from '../../paraglide/messages'
import type { AgentDetectionResult, AgentId } from '../../types'

export function SkillsSettingsPage({
  workspaceRoot
}: {
  workspaceRoot?: string
}): React.JSX.Element {
  const [agents, setAgents] = useState<AgentDetectionResult[]>([])
  const [busyAgent, setBusyAgent] = useState<AgentId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const integrationRoot = workspaceRoot ?? ''

  async function refreshAgents(): Promise<void> {
    setAgents(await window.api.detectAgents())
  }

  useEffect(() => {
    setError(null)
    void refreshAgents().catch(() => setAgents([]))
  }, [])

  async function installAgent(agentId: AgentId): Promise<void> {
    setBusyAgent(agentId)
    setError(null)
    setMessage(null)
    try {
      await window.api.applyAgentInstall(integrationRoot, agentId)
      await refreshAgents()
      setMessage(m.skills_install_done())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusyAgent(null)
    }
  }

  async function uninstallAgent(agentId: AgentId): Promise<void> {
    setBusyAgent(agentId)
    setError(null)
    setMessage(null)
    try {
      await window.api.applyAgentDisable(integrationRoot, agentId)
      await refreshAgents()
      setMessage(m.skills_uninstall_done())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusyAgent(null)
    }
  }

  async function openAgentPath(targetPath?: string): Promise<void> {
    if (!targetPath) return
    setError(null)
    try {
      await window.api.openAgentPath(targetPath)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-xl border bg-fd-card p-4">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="size-4" />
          {m.skills_agents_title()}
        </div>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          {workspaceRoot
            ? m.skills_workspace_root({ path: workspaceRoot })
            : m.skills_global_install_root()}
        </p>
      </div>

      <AgentIntegrations
        agents={agents}
        busyAgent={busyAgent}
        onInstall={(agentId) => void installAgent(agentId)}
        onUninstall={(agentId) => void uninstallAgent(agentId)}
        onOpenPath={(targetPath) => void openAgentPath(targetPath)}
      />

      {message ? (
        <div className="rounded-lg border bg-fd-card p-3 text-sm text-fd-muted-foreground">
          {message}
        </div>
      ) : null}

      {error ? (
        <pre className="overflow-auto rounded-lg border bg-fd-error/10 p-3 text-sm text-fd-error">
          {error}
        </pre>
      ) : null}
    </section>
  )
}

function AgentIntegrations({
  agents,
  busyAgent,
  onInstall,
  onUninstall,
  onOpenPath
}: {
  agents: AgentDetectionResult[]
  busyAgent: AgentId | null
  onInstall: (agentId: AgentId) => void
  onUninstall: (agentId: AgentId) => void
  onOpenPath: (targetPath?: string) => void
}): React.JSX.Element {
  return (
    <section className="rounded-xl border bg-fd-card p-4">
      <h2 className="font-medium">{m.skills_agents_title()}</h2>
      <p className="mt-1 text-sm text-fd-muted-foreground">{m.skills_agents_description()}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.id} className="relative rounded-lg border bg-fd-background p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <AgentIcon agentId={agent.id} />
                  {agent.name}
                </div>
                <p className="mt-1 text-xs text-fd-muted-foreground">
                  {agent.status === 'installed'
                    ? m.skills_agent_installed()
                    : agent.status === 'detected'
                      ? m.skills_agent_detected()
                      : agent.reason || m.skills_agent_not_detected()}
                </p>
              </div>
              {agent.status === 'installed' ? (
                <span className="absolute right-3 bottom-3 rounded-md border border-fd-primary/30 bg-fd-primary/10 px-2 py-1 text-xs text-fd-primary">
                  {m.skills_installed_badge()}
                </span>
              ) : null}
              <span className="rounded-md border px-2 py-1 text-xs text-fd-muted-foreground">
                {integrationModeLabel(agent.integrationMode)}
              </span>
            </div>
            <p className="mt-3 text-xs text-fd-muted-foreground">{integrationStrategy(agent.id)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onInstall(agent.id)}
                disabled={busyAgent === agent.id}
                className="rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground disabled:opacity-50"
              >
                {m.skills_install()}
              </button>
              <button
                type="button"
                onClick={() => onUninstall(agent.id)}
                disabled={busyAgent === agent.id}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent disabled:opacity-50"
              >
                {m.skills_uninstall()}
              </button>
              <button
                type="button"
                onClick={() => onOpenPath(agent.targetPath)}
                disabled={!agent.targetPath}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent disabled:opacity-50"
              >
                {m.skills_open_path()}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AgentIcon({ agentId }: { agentId: AgentId }): React.JSX.Element {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-fd-card">
      <img src={agentIconSource(agentId)} alt="" className="size-5 rounded-sm" />
    </span>
  )
}

function agentIconSource(agentId: AgentId): string {
  if (agentId === 'claude-code') return claudeCodeIcon
  if (agentId === 'codex') return codexIcon
  return cursorIcon
}

function integrationStrategy(agentId: AgentId): string {
  if (agentId === 'claude-code') return m.skills_strategy_claude_code()
  if (agentId === 'codex') return m.skills_strategy_codex()
  return m.skills_strategy_cursor()
}

function integrationModeLabel(mode: AgentDetectionResult['integrationMode']): string {
  if (mode === 'native-plugin') return 'Plugin'
  if (mode === 'managed-directory') return 'Skill'
  if (mode === 'managed-file') return 'Rules file'
  return 'Copy only'
}
