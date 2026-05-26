import type { AgentAdapter } from './types'
import { skillPlatformTargets } from './platform-targets'
import { createPlatformSkillAdapter } from './adapters/platform-skill'

export const agentAdapters: AgentAdapter[] = skillPlatformTargets.map(createPlatformSkillAdapter)

export function detectAgents() {
  return agentAdapters.map((adapter) => adapter.detect())
}