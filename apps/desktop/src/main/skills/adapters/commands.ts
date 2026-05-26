import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { delimiter, join } from 'path'

export function resolveCommand(command: string): string | undefined {
  const direct = resolveCommandFromPath(command)
  if (direct) return direct

  if (process.platform !== 'win32') return undefined

  const volta = resolveVoltaCommand(command)
  if (volta) return volta

  return undefined
}

export function commandExists(command: string): boolean {
  return Boolean(resolveCommand(command))
}

export function commandEnv(): NodeJS.ProcessEnv {
  if (process.platform !== 'win32') return process.env

  const pathParts = [
    process.env.PATH,
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Volta', 'bin') : undefined,
    join(homedir(), 'AppData', 'Local', 'Volta', 'bin')
  ]
    .filter(Boolean)
    .join(delimiter)

  return { ...process.env, PATH: pathParts, Path: pathParts }
}

function resolveCommandFromPath(command: string): string | undefined {
  const bin = process.platform === 'win32' ? 'where.exe' : 'command'
  const args = process.platform === 'win32' ? [command] : ['-v', command]
  try {
    const output = execFileSync(bin, args, { encoding: 'utf-8', env: commandEnv(), timeout: 1500 })
    const matches = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (process.platform === 'win32') {
      return (
        matches.find((line) => line.toLowerCase().endsWith('.cmd')) ??
        matches.find((line) => line.toLowerCase().endsWith('.exe')) ??
        matches[0]
      )
    }

    return matches[0]
  } catch {
    return undefined
  }
}

function resolveVoltaCommand(command: string): string | undefined {
  const localAppData = process.env.LOCALAPPDATA
  const userProfile = process.env.USERPROFILE
  const home = homedir()
  const roots = [
    localAppData ? join(localAppData, 'Volta', 'bin') : undefined,
    userProfile ? join(userProfile, 'AppData', 'Local', 'Volta', 'bin') : undefined,
    home ? join(home, 'AppData', 'Local', 'Volta', 'bin') : undefined
  ].filter(Boolean) as string[]

  const names = [`${command}.cmd`, `${command}.exe`, command]
  for (const root of roots) {
    for (const name of names) {
      const candidate = join(root, name)
      if (existsSync(candidate)) return candidate
    }
  }

  return undefined
}
