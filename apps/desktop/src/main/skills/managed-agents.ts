import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'fs'
import { dirname, join, resolve } from 'path'
import type { AgentId } from './types'
import { getInstalledSkillPath, getSkillPlatformTarget, mdxforgeSkillName } from './platform-targets'
import { commandEnv, commandExists, resolveCommand } from './adapters/commands'
import {
  claudeMarketplaceName,
  claudePluginName,
  getClaudeMarketplaceRoot
} from './adapters/claude-plugin'

const managedAgentIds = new Set<AgentId>()

export function isManagedAgentInstall(agentId: AgentId): boolean {
  return managedAgentIds.has(agentId)
}

export interface ManagedAgentInstallResult {
  agentId: AgentId
  operation: 'install' | 'disable'
  relativePath: string
  kind: 'directory'
  action: 'create' | 'update' | 'delete'
  before: string
  after: string
  diff: string
  reason?: string
}

export function previewManagedAgentInstall(
  workspaceRoot: string,
  agentId: AgentId
): ManagedAgentInstallResult {
  if (agentId !== 'claude-code') throw new Error(`Unsupported managed agent: ${agentId}`)
  const root = getClaudeMarketplaceRoot()
  return {
    agentId,
    operation: 'install',
    relativePath: displayPath(root),
    kind: 'directory',
    action: existsSync(root) ? 'update' : 'create',
    before: existsSync(root) ? 'existing local Claude marketplace/plugin link' : '',
    after: [
      `${displayPath(root)} -> ${displayPath(workspaceRoot)}`,
      `Claude marketplace -> ${claudeMarketplaceName}`,
      `Claude plugin -> ${claudePluginName}`,
      `Skill source -> ${displayPath(join(workspaceRoot, 'skills', mdxforgeSkillName))}`
    ].join('\n'),
    diff: [
      'Claude Code native plugin install (global)',
      `1. Link ${displayPath(root)} -> ${displayPath(workspaceRoot)}`,
      `2. claude plugin marketplace add ${displayPath(root)}`,
      `3. claude plugin install ${claudePluginName}@${claudeMarketplaceName}`,
      'No skill files copied.'
    ].join('\n')
  }
}

export function applyManagedAgentInstall(
  workspaceRoot: string,
  agentId: AgentId
): ManagedAgentInstallResult {
  const preview = previewManagedAgentInstall(workspaceRoot, agentId)
  installClaudePlugin(resolve(workspaceRoot))
  return preview
}

export function previewManagedAgentDisable(
  _workspaceRoot: string,
  agentId: AgentId
): ManagedAgentInstallResult {
  if (agentId !== 'claude-code') throw new Error(`Unsupported managed agent: ${agentId}`)
  const root = getClaudeMarketplaceRoot()
  return {
    agentId,
    operation: 'disable',
    relativePath: displayPath(root),
    kind: 'directory',
    action: 'delete',
    before: existsSync(root) ? displayPath(root) : '',
    after: '',
    diff: `Claude Code uninstall -> ${claudePluginName}@${claudeMarketplaceName}\nRemove global link -> ${displayPath(root)}`
  }
}

export function applyManagedAgentDisable(
  workspaceRoot: string,
  agentId: AgentId
): ManagedAgentInstallResult {
  const preview = previewManagedAgentDisable(workspaceRoot, agentId)
  if (agentId === 'claude-code') {
    runClaude(['plugin', 'uninstall', `${claudePluginName}@${claudeMarketplaceName}`], false)
    runClaude(['plugin', 'marketplace', 'remove', claudeMarketplaceName], false)
    rmSync(getClaudeMarketplaceRoot(), { recursive: true, force: true })
  }
  return preview
}

function installClaudePlugin(workspaceRoot: string): void {
  if (!commandExists('claude')) {
    throwClaudeMissingError()
  }

  ensureRepoPluginFilesExist(workspaceRoot)
  linkPath(getClaudeMarketplaceRoot(), workspaceRoot)
  runClaude(['plugin', 'marketplace', 'add', getClaudeMarketplaceRoot()], false)
  runClaude(['plugin', 'install', `${claudePluginName}@${claudeMarketplaceName}`], true)
}

function ensureRepoPluginFilesExist(workspaceRoot: string): void {
  const skillRoot = join(workspaceRoot, 'skills', mdxforgeSkillName)
  if (!existsSync(join(workspaceRoot, '.claude-plugin', 'marketplace.json'))) {
    throw new Error('Missing .claude-plugin/marketplace.json in MDXForge repo.')
  }
  if (!existsSync(join(workspaceRoot, '.claude-plugin', 'plugin.json'))) {
    throw new Error('Missing .claude-plugin/plugin.json in MDXForge repo.')
  }
  if (!existsSync(skillRoot)) throw new Error(`Missing skill directory: ${skillRoot}`)
}

export function installPlatformSkillLink(agentId: AgentId, workspaceRoot: string): void {
  const target = getSkillPlatformTarget(agentId)
  if (!target) throw new Error(`Unknown agent target: ${agentId}`)
  const linkTarget = getInstalledSkillPath(target)
  const sourceSkill = join(resolve(workspaceRoot), 'skills', mdxforgeSkillName)
  if (!existsSync(sourceSkill)) throw new Error(`Missing skill directory: ${sourceSkill}`)
  linkPath(linkTarget, sourceSkill)
}

export function uninstallPlatformSkillLink(agentId: AgentId): void {
  const target = getSkillPlatformTarget(agentId)
  if (!target) throw new Error(`Unknown agent target: ${agentId}`)
  rmSync(getInstalledSkillPath(target), { recursive: true, force: true })
}

function linkPath(linkPathValue: string, targetPath: string): void {
  rmSync(linkPathValue, { recursive: true, force: true })
  mkdirSync(dirname(linkPathValue), { recursive: true })
  symlinkSync(targetPath, linkPathValue, process.platform === 'win32' ? 'junction' : 'dir')
}

function runClaude(args: string[], throwOnFailure: boolean): void {
  const command = resolveCommand('claude')
  if (!command) {
    if (throwOnFailure) throwClaudeMissingError()
    return
  }

  try {
    execFileSync(command, args, { env: commandEnv(), stdio: 'ignore', timeout: 30_000 })
  } catch (error) {
    if (!throwOnFailure) return
    if (isSpawnMissingError(error)) throwClaudeMissingError()
    throw error
  }
}

function throwClaudeMissingError(): never {
  throw new Error(
    'Claude Code CLI was not found on PATH or Volta. Install Claude Code, or restart MDXForge after adding `claude` to PATH.'
  )
}

function isSpawnMissingError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  )
}

function displayPath(path: string): string {
  return path.replace(/\\/g, '/')
}
