import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'fs'
import { dirname, join, resolve } from 'path'
import { agentAdapters } from './agents'
import { createTextDiff } from './diff'
import { removeManagedBlock, upsertManagedBlock } from './managed-block'
import { isPathInside, toPosixRelativePath } from './path-utils'
import { buildCompactAgentRules } from './rules'
import { getInstalledSkillPath, getSkillPlatformTarget } from './platform-targets'
import {
  applyManagedAgentDisable,
  applyManagedAgentInstall,
  installPlatformSkillLink,
  isManagedAgentInstall,
  previewManagedAgentDisable,
  previewManagedAgentInstall,
  uninstallPlatformSkillLink
} from './managed-agents'
import type { AgentAdapter, AgentId, ProjectedDirectory, WorkspaceSkill } from './types'

export interface AgentInstallPreview {
  agentId: AgentId
  operation: 'install' | 'disable'
  relativePath: string
  kind: 'file' | 'directory'
  action: 'create' | 'update' | 'copy' | 'delete' | 'conflict'
  before: string
  after: string
  diff: string
  reason?: string
}

export function previewAgentInstall(workspaceRoot: string, agentId: AgentId): AgentInstallPreview {
  if (isManagedAgentInstall(agentId)) return previewManagedAgentInstall(resolveAppRoot(workspaceRoot), agentId)

  const projection = getAgentProjection(resolveAppRoot(workspaceRoot), agentId)
  if ('content' in projection && projection.action === 'copy') {
    return {
      agentId,
      operation: 'install',
      relativePath: '',
      kind: 'file',
      action: 'copy',
      before: '',
      after: projection.content,
      diff: projection.content
    }
  }

  if ('files' in projection) return previewDirectoryInstall(workspaceRoot, projection)

  const targetPath = resolveProjectionTarget(projection.agentId, projection.path)

  const before = existsSync(targetPath) ? readFileSync(targetPath, 'utf-8') : ''
  const block = upsertManagedBlock(before, projection.content)
  const action = before ? 'update' : 'create'
  const relativePath = displayPath(targetPath)

  return {
    agentId,
    operation: 'install',
    relativePath,
    kind: 'file',
    action: block.conflict ? 'conflict' : action,
    before,
    after: block.content,
    diff: createTextDiff(relativePath, before, block.content),
    reason: block.conflict ? block.reason : undefined
  }
}

export function applyAgentInstall(workspaceRoot: string, agentId: AgentId): AgentInstallPreview {
  if (isManagedAgentInstall(agentId)) return applyManagedAgentInstall(resolveAppRoot(workspaceRoot), agentId)

  const preview = previewAgentInstall(workspaceRoot, agentId)
  if (preview.action === 'copy') return preview
  if (preview.action === 'conflict') throw new Error(preview.reason ?? 'Projection conflict.')

  const targetPath = resolveProjectionTarget(agentId, preview.relativePath)

  if (preview.kind === 'directory') {
    installPlatformSkillLink(agentId, resolveAppRoot(workspaceRoot))
    return preview
  }

  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, preview.after, 'utf-8')
  return preview
}

export function previewAgentDisable(workspaceRoot: string, agentId: AgentId): AgentInstallPreview {
  if (isManagedAgentInstall(agentId)) return previewManagedAgentDisable(resolveAppRoot(workspaceRoot), agentId)

  const projection = getAgentProjection(resolveAppRoot(workspaceRoot), agentId)
  if ('content' in projection && projection.action === 'copy') {
    return {
      agentId,
      operation: 'disable',
      relativePath: '',
      kind: 'file',
      action: 'copy',
      before: '',
      after: '',
      diff: '',
      reason: 'Copy-only agents do not write managed blocks.'
    }
  }

  if ('files' in projection) return previewDirectoryDisable(workspaceRoot, projection)

  const targetPath = resolveProjectionTarget(projection.agentId, projection.path)

  const before = existsSync(targetPath) ? readFileSync(targetPath, 'utf-8') : ''
  const block = removeManagedBlock(before)
  const relativePath = displayPath(targetPath)

  return {
    agentId,
    operation: 'disable',
    relativePath,
    kind: 'file',
    action: block.conflict ? 'conflict' : 'update',
    before,
    after: block.content,
    diff: createTextDiff(relativePath, before, block.content),
    reason: block.conflict ? block.reason : undefined
  }
}

export function applyAgentDisable(workspaceRoot: string, agentId: AgentId): AgentInstallPreview {
  if (isManagedAgentInstall(agentId)) return applyManagedAgentDisable(resolveAppRoot(workspaceRoot), agentId)

  const preview = previewAgentDisable(workspaceRoot, agentId)
  if (preview.action === 'copy') return preview
  if (preview.action === 'conflict') throw new Error(preview.reason ?? 'Managed block conflict.')

  const targetPath = resolveProjectionTarget(agentId, preview.relativePath)

  if (preview.kind === 'directory') {
    uninstallPlatformSkillLink(agentId)
    return preview
  }

  writeFileSync(targetPath, preview.after, 'utf-8')
  return preview
}

function previewDirectoryInstall(
  _workspaceRoot: string,
  projection: ProjectedDirectory
): AgentInstallPreview {
  const targetPath = resolveProjectionTarget(projection.agentId, projection.path)

  const before = existsSync(targetPath) ? listDirectoryFiles(targetPath).join('\n') : ''
  const after = projection.files
    .map((file) => file.relativePath)
    .sort()
    .join('\n')
  const relativePath = displayPath(targetPath)
  return {
    agentId: projection.agentId,
    operation: 'install',
    relativePath,
    kind: 'directory',
    action: before ? 'update' : 'create',
    before,
    after,
    diff: createTextDiff(`${relativePath}/`, before, after)
  }
}

function previewDirectoryDisable(
  _workspaceRoot: string,
  projection: ProjectedDirectory
): AgentInstallPreview {
  const targetPath = resolveProjectionTarget(projection.agentId, projection.path)

  const before = existsSync(targetPath) ? listDirectoryFiles(targetPath).join('\n') : ''
  const relativePath = displayPath(targetPath)
  return {
    agentId: projection.agentId,
    operation: 'disable',
    relativePath,
    kind: 'directory',
    action: before ? 'delete' : 'update',
    before,
    after: '',
    diff: createTextDiff(`${relativePath}/`, before, '')
  }
}

function getAgentProjection(workspaceRoot: string, agentId: AgentId) {
  const adapter = agentAdapters.find((item) => item.id === agentId)
  if (!adapter) throw new Error(`Unknown agent adapter: ${agentId}`)

  const root = resolveAppRoot(workspaceRoot)
  const skill = createBuiltinMdxForgeSkill(root)

  if (adapter.projectDirectory) return projectSkillDirectory(root, adapter, skill, agentId)

  const rules = buildCompactAgentRules(skill, agentId)
  const [projection] = adapter.project({ workspaceRoot: root, skill, rules })
  if (!projection) throw new Error(`Agent adapter did not produce a projection: ${agentId}`)
  return projection
}

function projectSkillDirectory(
  workspaceRoot: string,
  adapter: AgentAdapter,
  skill: WorkspaceSkill,
  agentId: AgentId
): ProjectedDirectory {
  const rules = buildCompactAgentRules(skill, agentId)
  const directory = adapter.projectDirectory?.({ workspaceRoot, skill, rules })
  if (!directory) throw new Error(`Agent adapter did not produce a directory: ${agentId}`)

  directory.files = collectSkillFiles(skill, agentId)
  return directory
}

function collectSkillFiles(skill: WorkspaceSkill, agentId: AgentId) {
  const rootPath = skill.rootPath
  if (!rootPath) {
    return [
      { sourcePath: '', relativePath: 'SKILL.md', content: buildCompactAgentRules(skill, agentId) }
    ]
  }

  const root = resolve(rootPath)
  const files: ReturnType<ProjectedDirectory['files']['slice']> = []
  collectFiles(root, root, files)
  if (!files.some((file) => file.relativePath === 'SKILL.md')) {
    files.unshift({
      sourcePath: '',
      relativePath: 'SKILL.md',
      content: buildCompactAgentRules(skill, agentId)
    })
  }
  return files
}

function collectFiles(root: string, current: string, files: ProjectedDirectory['files']): void {
  for (const entry of readdirSync(current)) {
    const path = join(current, entry)
    if (!isPathInside(root, path)) continue
    const stats = statSync(path)
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue
      collectFiles(root, path, files)
      continue
    }
    if (!stats.isFile()) continue
    const relativePath = toPosixRelativePath(root, path)
    files.push({ sourcePath: path, relativePath, content: readFileSync(path, 'utf-8') })
  }
}

function listDirectoryFiles(targetPath: string): string[] {
  if (!existsSync(targetPath)) return []
  const files: string[] = []
  collectExistingFiles(targetPath, targetPath, files)
  return files.sort()
}

function collectExistingFiles(root: string, current: string, files: string[]): void {
  for (const entry of readdirSync(current)) {
    const path = join(current, entry)
    if (!isPathInside(root, path)) continue
    const stats = statSync(path)
    if (stats.isDirectory()) {
      collectExistingFiles(root, path, files)
      continue
    }
    if (stats.isFile()) files.push(toPosixRelativePath(root, path))
  }
}

function resolveProjectionTarget(agentId: AgentId, targetPath: string): string {
  const target = getSkillPlatformTarget(agentId)
  if (!target) throw new Error(`Unknown agent target: ${agentId}`)

  const resolvedTarget = resolve(targetPath)
  const allowedRoot = resolve(getInstalledSkillPath(target))
  if (!isPathInside(allowedRoot, resolvedTarget)) {
    throw new Error('Target must stay inside the agent skills directory.')
  }
  return resolvedTarget
}

function resolveAppRoot(workspaceRoot: string): string {
  if (workspaceRoot) return resolve(workspaceRoot)
  const candidates = [
    resolve(process.cwd()),
    resolve(process.cwd(), '..', '..'),
    resolve(__dirname, '..', '..', '..', '..'),
    resolve(__dirname, '..', '..', '..', '..', '..')
  ]
  return candidates.find((candidate) => existsSync(join(candidate, 'skills', 'mdxforge-mdx'))) ?? candidates[0]
}

function createBuiltinMdxForgeSkill(root: string): WorkspaceSkill {
  return {
    name: 'mdxforge-mdx',
    title: 'MDXForge MDX',
    version: '0.1.0',
    source: 'builtin:mdxforge-mdx',
    kind: 'builtin',
    status: 'active',
    rootPath: join(root, 'skills', 'mdxforge-mdx'),
    types: ['writing'],
    rules: [{ path: join(root, 'skills', 'mdxforge-mdx', 'SKILL.md'), content: '' }],
    components: [],
    permissions: ['Adds AI writing rules']
  }
}

function displayPath(targetPath: string): string {
  return targetPath.replace(/\\/g, '/')
}
export function ensurePreviewTargetDirectory(workspaceRoot: string, relativePath: string): string {
  const targetPath = resolve(workspaceRoot, relativePath)
  if (!isPathInside(workspaceRoot, targetPath))
    throw new Error('Target file must stay inside workspace.')
  return dirname(targetPath)
}
