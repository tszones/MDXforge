import type { AgentDetectionResult, AgentId, AgentIntegrationMode } from '../types'
import { commandExists } from './commands'

export function detectCommandAgent(
  id: AgentId,
  name: string,
  command: string,
  integrationMode: AgentIntegrationMode,
  targetRelativePath?: string
): AgentDetectionResult {
  if (!commandExists(command)) {
    return {
      id,
      name,
      status: 'not-detected',
      integrationMode,
      command,
      targetPath: targetRelativePath,
      reason: `${command} was not found on PATH.`
    }
  }

  return { id, name, status: 'detected', integrationMode, command, targetPath: targetRelativePath }
}

export function detectOptionalCommandAgent(
  id: AgentId,
  name: string,
  command: string | undefined,
  integrationMode: AgentIntegrationMode,
  targetRelativePath?: string
): AgentDetectionResult {
  if (!command) {
    return { id, name, status: 'detected', integrationMode, targetPath: targetRelativePath }
  }
  return detectCommandAgent(id, name, command, integrationMode, targetRelativePath)
}