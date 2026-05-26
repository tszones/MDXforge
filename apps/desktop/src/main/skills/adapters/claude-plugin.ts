import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectOptionalCommandAgent } from './detect'

const home = process.env.MDXFORGE_SKILLS_HOME || homedir()

export const claudeMarketplaceName = 'mdxforge-local'
export const claudePluginName = 'mdxforge'

export function getClaudeMarketplaceRoot(): string {
  return join(home, '.mdxforge', 'agent-integrations', 'claude-code', 'marketplace')
}

export function getClaudePluginRoot(): string {
  return join(getClaudeMarketplaceRoot(), claudePluginName)
}

export function createClaudePluginAdapter(): AgentAdapter {
  const marketplaceRoot = getClaudeMarketplaceRoot()
  return {
    id: 'claude-code',
    name: 'Claude Code',
    integrationMode: 'native-plugin',
    targetRelativePath: marketplaceRoot,
    detect: () => {
      const detected = detectOptionalCommandAgent(
        'claude-code',
        'Claude Code',
        'claude',
        'native-plugin',
        marketplaceRoot
      )
      return existsSync(marketplaceRoot) ? { ...detected, status: 'installed' as const } : detected
    },
    project: () => []
  }
}
