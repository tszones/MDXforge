import { execFileSync } from 'child_process'
import type { AgentDetectionResult, AgentId, AgentIntegrationMode } from '../types'

export function commandExists(command: string): boolean {
  const bin = process.platform === 'win32' ? 'where.exe' : 'command'
  const args = process.platform === 'win32' ? [command] : ['-v', command]
  try {
    execFileSync(bin, args, { stdio: 'ignore', timeout: 1500 })
    return true
  } catch {
    return false
  }
}

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
