import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectCommandAgent } from './detect'

const aiderSkillDir = join('.aider', 'skills', 'mdxforge-mdx')

export const aiderAdapter: AgentAdapter = {
  id: 'aider',
  name: 'Aider',
  integrationMode: 'managed-directory',
  targetRelativePath: aiderSkillDir,
  detect: () => detectCommandAgent('aider', 'Aider', 'aider', 'managed-directory', aiderSkillDir),
  project: ({ workspaceRoot, rules }) => [
    {
      agentId: 'aider',
      path: join(workspaceRoot, aiderSkillDir, 'SKILL.md'),
      relativePath: join(aiderSkillDir, 'SKILL.md'),
      action: 'update',
      content: rules
    }
  ],
  projectDirectory: ({ workspaceRoot }) => ({
    agentId: 'aider',
    path: join(workspaceRoot, aiderSkillDir),
    relativePath: aiderSkillDir,
    files: []
  })
}
