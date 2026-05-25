import { aiderAdapter } from './adapters/aider'
import { claudeCodeAdapter } from './adapters/claude-code'
import { codexAdapter } from './adapters/codex'
import { cursorAdapter } from './adapters/cursor'
import type { AgentAdapter } from './types'

export const agentAdapters: AgentAdapter[] = [
  claudeCodeAdapter,
  cursorAdapter,
  codexAdapter,
  aiderAdapter
]

export function detectAgents() {
  return agentAdapters.map((adapter) => adapter.detect())
}
