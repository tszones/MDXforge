export function join(...parts: string[]) {
  const segments: string[] = []

  for (const part of parts) {
    for (const segment of part.split(/[/\\]+/)) {
      if (!segment || segment === '.') continue
      if (segment === '..') segments.pop()
      else segments.push(segment)
    }
  }

  return segments.join('/')
}

export function dirname(path: string) {
  const normalized = path.replace(/\\+/g, '/')
  const index = normalized.lastIndexOf('/')
  return index === -1 ? '' : normalized.slice(0, index)
}

export default { join, dirname }
