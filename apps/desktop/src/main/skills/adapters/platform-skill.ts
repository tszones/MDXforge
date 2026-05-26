import { existsSync } from 'fs'
import { join } from 'path'
import type { AgentAdapter } from '../types'
import { detectOptionalCommandAgent } from './detect'
import { getInstalledSkillPath, type SkillPlatformTarget } from '../platform-targets'

export function createPlatformSkillAdapter(target: SkillPlatformTarget): AgentAdapter {
  const targetPath = getInstalledSkillPath(target)
  const mode = target.style === 'folder' ? 'managed-directory' : 'managed-directory'
  return {
    id: target.id,
    name: target.name,
    integrationMode: mode,
    targetRelativePath: targetPath,
    detect: () => {
      const detected = detectOptionalCommandAgent(target.id, target.name, target.command, mode, targetPath)
      return existsSync(targetPath) ? { ...detected, status: 'installed' as const } : detected
    },
    project: ({ rules }) => [
      {
        agentId: target.id,
        path: join(targetPath, 'SKILL.md'),
        relativePath: join(targetPath, 'SKILL.md'),
        action: 'update',
        content: rules
      }
    ],
    projectDirectory: () => ({
      agentId: target.id,
      path: targetPath,
      relativePath: targetPath,
      files: []
    })
  }
}