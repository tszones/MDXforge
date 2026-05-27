import { createPlatformSkillAdapter } from './adapters/platform-skill'
import { skillPlatformTargets } from './platform-targets'
import type { AgentAdapter } from './types'

export const agentAdapters: AgentAdapter[] = skillPlatformTargets.map(createPlatformSkillAdapter)

export function detectAgents() {
  return agentAdapters.map((adapter) => adapter.detect())
}
