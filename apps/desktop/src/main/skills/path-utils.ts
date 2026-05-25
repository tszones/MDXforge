import { relative, resolve, sep } from 'path'

export function isPathInside(parentPath: string, childPath: string): boolean {
  const relativePath = relative(resolve(parentPath), resolve(childPath))
  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  )
}

export function toPosixRelativePath(parentPath: string, childPath: string): string {
  return relative(resolve(parentPath), resolve(childPath)).split(sep).join('/')
}
