import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectCommandAgent } from './detect'

const cursorSkillDir = join('.cursor', 'skills', 'mdxforge-mdx')

export const cursorAdapter: AgentAdapter = {
  id: 'cursor',
  name: 'Cursor',
  integrationMode: 'managed-directory',
  targetRelativePath: cursorSkillDir,
  detect: () =>
    detectCommandAgent('cursor', 'Cursor', 'cursor', 'managed-directory', cursorSkillDir),
  project: ({ workspaceRoot, rules }) => [
    {
      agentId: 'cursor',
      path: join(workspaceRoot, cursorSkillDir, 'SKILL.md'),
      relativePath: join(cursorSkillDir, 'SKILL.md'),
      action: 'update',
      content: rules
    }
  ],
  projectDirectory: ({ workspaceRoot }) => ({
    agentId: 'cursor',
    path: join(workspaceRoot, cursorSkillDir),
    relativePath: cursorSkillDir,
    files: []
  })
}
