export type SkillType = 'writing' | 'component' | 'template' | 'transform'

export const supportedSkillTypes = new Set<SkillType>([
  'writing',
  'component',
  'template',
  'transform'
])

export interface SkillRuleAsset {
  path: string
  content: string
}

export type SkillSourceKind = 'builtin' | 'workspace' | 'npm' | 'git' | 'unknown'
export type SkillStatus = 'active' | 'disabled' | 'missing' | 'invalid' | 'unsupported' | 'blocked'

export interface SkillCore {
  name: string
  title: string
  version: string
  types: SkillType[]
  rules: SkillRuleAsset[]
  components: string[]
  permissions: string[]
}

export interface SkillManifest {
  schema: number
  name: string
  title: string
  version: string
  description?: string
  types: SkillType[]
  rules: string[]
  components: string[]
  agentAdapters: string[]
}

export interface WorkspaceSkill extends SkillCore {
  source: string
  kind: SkillSourceKind
  status: SkillStatus
  rootPath?: string
  reason?: string
}

export interface WorkspaceSkillsState {
  workspaceRoot: string
  skills: WorkspaceSkill[]
  mergedRules: string
}

export type AgentId = 'claude-code' | 'cursor' | 'codex'
export type AgentStatus = 'detected' | 'not-detected' | 'installed' | 'error'
export type AgentIntegrationMode =
  | 'managed-file'
  | 'managed-directory'
  | 'native-plugin'
  | 'copy-only'

export interface AgentDetectionResult {
  id: AgentId
  name: string
  status: AgentStatus
  integrationMode: AgentIntegrationMode
  targetPath?: string
  command?: string
  reason?: string
}

export interface AgentAdapter {
  id: AgentId
  name: string
  integrationMode: AgentIntegrationMode
  targetRelativePath?: string
  detect: () => AgentDetectionResult
  project: (input: ProjectionInput) => ProjectedFile[]
  projectDirectory?: (input: ProjectionInput) => ProjectedDirectory
}

export interface ProjectionInput {
  workspaceRoot: string
  skill: WorkspaceSkill
  rules: string
}

export interface ProjectedFile {
  agentId: AgentId
  path: string
  relativePath: string
  action: 'create' | 'update' | 'copy'
  content: string
}

export interface ProjectedDirectoryFile {
  sourcePath: string
  relativePath: string
  content: string
}

export interface ProjectedDirectory {
  agentId: AgentId
  path: string
  relativePath: string
  files: ProjectedDirectoryFile[]
}
