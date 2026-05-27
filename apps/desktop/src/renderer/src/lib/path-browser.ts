const normalize = (value: string): string => value.replace(/\\/g, '/')

export function extname(value: string): string {
  const path = normalize(value)
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dotIndex = name.lastIndexOf('.')

  if (dotIndex <= 0) return ''
  return name.slice(dotIndex)
}

export function join(...parts: string[]): string {
  const joined = parts
    .filter((part) => part.length > 0)
    .join('/')
    .replace(/\/+/g, '/')

  return normalize(joined)
}

export function dirname(value: string): string {
  const path = normalize(value).replace(/\/+$/, '')
  const index = path.lastIndexOf('/')

  if (index <= 0) return ''
  return path.slice(0, index)
}

export default { join, dirname, extname }
