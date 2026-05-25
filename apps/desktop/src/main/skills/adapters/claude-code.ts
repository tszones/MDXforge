import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectCommandAgent } from './detect'

const claudeSkillDir = join('.claude', 'skills', 'mdxforge-mdx')

export const claudeCodeAdapter: AgentAdapter = {
  id: 'claude-code',
  name: 'Claude Code',
  integrationMode: 'managed-directory',
  targetRelativePath: claudeSkillDir,
  detect: () =>
    detectCommandAgent('claude-code', 'Claude Code', 'claude', 'managed-directory', claudeSkillDir),
  project: ({ workspaceRoot, rules }) => [
    {
      agentId: 'claude-code',
      path: join(workspaceRoot, claudeSkillDir, 'SKILL.md'),
      relativePath: join(claudeSkillDir, 'SKILL.md'),
      action: 'update',
      content: rules
    }
  ],
  projectDirectory: ({ workspaceRoot }) => ({
    agentId: 'claude-code',
    path: join(workspaceRoot, claudeSkillDir),
    relativePath: claudeSkillDir,
    files: []
  })
}
