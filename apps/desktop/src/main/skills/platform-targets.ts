import { homedir } from 'os'
import { join } from 'path'
import type { AgentId } from './types'

export type SkillInstallStyle = 'per-skill' | 'folder'

export interface SkillPlatformTarget {
  id: AgentId
  name: string
  command?: string
  skillsDir: string
  style: SkillInstallStyle
}

const home = process.env.MDXFORGE_SKILLS_HOME || homedir()

export const mdxforgeSkillName = 'mdxforge-mdx'

export const skillPlatformTargets: SkillPlatformTarget[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    command: 'claude',
    skillsDir: join(home, '.claude', 'skills'),
    style: 'per-skill'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    command: 'cursor',
    skillsDir: join(home, '.cursor', 'skills'),
    style: 'per-skill'
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    command: 'codex',
    skillsDir: join(home, '.agents', 'skills'),
    style: 'per-skill'
  }
]

export function getInstalledSkillPath(target: SkillPlatformTarget): string {
  const containerName = 'mdxforge'
  return target.style === 'folder'
    ? join(target.skillsDir, containerName, mdxforgeSkillName)
    : join(target.skillsDir, mdxforgeSkillName)
}

export function getSkillPlatformTarget(agentId: AgentId): SkillPlatformTarget | undefined {
  return skillPlatformTargets.find((target) => target.id === agentId)
}
