import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectCommandAgent } from './detect'

const codexSkillDir = join('.codex', 'skills', 'mdxforge-mdx')

export const codexAdapter: AgentAdapter = {
  id: 'codex',
  name: 'Codex CLI',
  integrationMode: 'managed-directory',
  targetRelativePath: codexSkillDir,
  detect: () =>
    detectCommandAgent('codex', 'Codex CLI', 'codex', 'managed-directory', codexSkillDir),
  project: ({ workspaceRoot, rules }) => [
    {
      agentId: 'codex',
      path: join(workspaceRoot, codexSkillDir, 'SKILL.md'),
      relativePath: join(codexSkillDir, 'SKILL.md'),
      action: 'update',
      content: rules
    }
  ],
  projectDirectory: ({ workspaceRoot }) => ({
    agentId: 'codex',
    path: join(workspaceRoot, codexSkillDir),
    relativePath: codexSkillDir,
    files: []
  })
}
