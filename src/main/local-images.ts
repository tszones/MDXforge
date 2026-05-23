import { existsSync, statSync } from 'fs'
import { dirname, extname, isAbsolute, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

export const LOCAL_IMAGE_SCHEME = 'mdxforge-local-image'

const LOCAL_IMAGE_EXTENSIONS = new Set([
  '.apng',
  '.avif',
  '.bmp',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp'
])

const registeredLocalImages = new Map<string, string>()

export interface LocalImageContext {
  documentPath: string
  workspaceRoot?: string
}

type TreeNode = {
  type?: string
  name?: string
  url?: string
  attributes?: MdxJsxAttribute[]
  children?: TreeNode[]
}

type MdxJsxAttribute = {
  type?: string
  name?: string
  value?: unknown
}

type SplitImageSource = {
  path: string
  suffix: string
}

export function remarkLocalImages(context: LocalImageContext) {
  return function transformLocalImages(tree: TreeNode): void {
    rewriteLocalImageNodes(tree, context)
  }
}

export function resolveLocalImageSource(source: string, context: LocalImageContext): string | null {
  const splitSource = splitImageSource(source)
  if (!splitSource || isProtocolRelativeUrl(splitSource.path)) return null

  const filePath = resolveLocalImagePath(splitSource.path, context)
  if (!filePath || !isSupportedLocalImageFile(filePath)) return null

  return createLocalImageUrl(filePath, splitSource.suffix)
}

export function getRegisteredLocalImagePath(id: string): string | null {
  return registeredLocalImages.get(id) ?? null
}

export function getLocalImageIdFromUrl(source: string): string | null {
  try {
    const url = new URL(source)
    if (url.protocol !== `${LOCAL_IMAGE_SCHEME}:` || url.hostname !== 'asset') return null
    const id = url.pathname.slice(1)
    return id.length > 0 ? id : null
  } catch {
    return null
  }
}

export function isSupportedLocalImageFile(filePath: string): boolean {
  try {
    return (
      LOCAL_IMAGE_EXTENSIONS.has(extname(filePath).toLowerCase()) &&
      existsSync(filePath) &&
      statSync(filePath).isFile()
    )
  } catch {
    return false
  }
}

function rewriteLocalImageNodes(node: TreeNode, context: LocalImageContext): void {
  if (node.type === 'image' && typeof node.url === 'string') {
    const resolvedSource = resolveLocalImageSource(node.url, context)
    if (resolvedSource) node.url = resolvedSource
  }

  if (isMdxImageElement(node)) {
    const srcAttribute = node.attributes?.find(
      (attribute) =>
        attribute.type === 'mdxJsxAttribute' &&
        attribute.name === 'src' &&
        typeof attribute.value === 'string'
    )
    const resolvedSource =
      typeof srcAttribute?.value === 'string'
        ? resolveLocalImageSource(srcAttribute.value, context)
        : null

    if (resolvedSource && srcAttribute) srcAttribute.value = resolvedSource
  }

  for (const child of node.children ?? []) {
    rewriteLocalImageNodes(child, context)
  }
}

function isMdxImageElement(node: TreeNode): boolean {
  return (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    (node.name === 'img' || node.name === 'ImageZoom')
  )
}

function resolveLocalImagePath(sourcePath: string, context: LocalImageContext): string | null {
  const rootPath = resolve(context.workspaceRoot ?? dirname(context.documentPath))

  if (hasUrlScheme(sourcePath)) {
    if (!sourcePath.toLowerCase().startsWith('file:')) return null

    try {
      return constrainLocalImagePath(resolve(fileURLToPath(sourcePath)), rootPath)
    } catch {
      return null
    }
  }

  const decodedPath = decodeImagePath(sourcePath)
  if (!decodedPath) return null

  if (isWindowsAbsolutePath(decodedPath)) {
    return constrainLocalImagePath(resolve(decodedPath), rootPath)
  }

  if (decodedPath.startsWith('/')) {
    const workspacePath = context.workspaceRoot
      ? resolve(context.workspaceRoot, `.${decodedPath}`)
      : null
    if (workspacePath && isSupportedLocalImageFile(workspacePath)) return workspacePath

    return constrainLocalImagePath(resolve(decodedPath), rootPath)
  }

  if (isAbsolute(decodedPath)) return constrainLocalImagePath(resolve(decodedPath), rootPath)

  return constrainLocalImagePath(resolve(dirname(context.documentPath), decodedPath), rootPath)
}

function createLocalImageUrl(filePath: string, suffix: string): string {
  const id = Buffer.from(resolve(filePath), 'utf8').toString('base64url')
  registeredLocalImages.set(id, resolve(filePath))
  return `${LOCAL_IMAGE_SCHEME}://asset/${id}${suffix}`
}

function splitImageSource(source: string): SplitImageSource | null {
  const trimmedSource = source.trim()
  if (!trimmedSource || trimmedSource.startsWith('#')) return null

  const hashIndex = trimmedSource.indexOf('#')
  const sourceBeforeHash = hashIndex === -1 ? trimmedSource : trimmedSource.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : trimmedSource.slice(hashIndex)
  const queryIndex = sourceBeforeHash.indexOf('?')

  if (queryIndex === -1) return { path: sourceBeforeHash, suffix: hash }

  return {
    path: sourceBeforeHash.slice(0, queryIndex),
    suffix: `${sourceBeforeHash.slice(queryIndex)}${hash}`
  }
}

function decodeImagePath(sourcePath: string): string | null {
  try {
    return decodeURIComponent(sourcePath)
  } catch {
    return null
  }
}

function constrainLocalImagePath(filePath: string, rootPath: string): string | null {
  const relativePath = relative(rootPath, filePath)
  if (relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))) {
    return filePath
  }

  return null
}

function hasUrlScheme(sourcePath: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(sourcePath)
}

function isProtocolRelativeUrl(sourcePath: string): boolean {
  return sourcePath.startsWith('//')
}

function isWindowsAbsolutePath(sourcePath: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(sourcePath) || /^\\\\/.test(sourcePath)
}
