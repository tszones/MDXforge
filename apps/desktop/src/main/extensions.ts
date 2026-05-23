import { existsSync, readFileSync, statSync } from 'fs'
import { isAbsolute, join, relative, resolve, sep } from 'path'

export type ExtensionMode = 'safe' | 'trusted'
export type ExtensionPackageType =
  | 'component'
  | 'theme'
  | 'rules'
  | 'template'
  | 'transform'
  | 'resource'
export type ExtensionReferenceKind = 'workspace' | 'npm' | 'git' | 'unknown'
export type ExtensionReferenceStatus =
  | 'available'
  | 'blocked'
  | 'missing'
  | 'invalid'
  | 'unsupported'

export interface ExtensionAsset {
  path: string
  url?: string
}

export interface WorkspaceExtensionPackage {
  name: string
  version: string
  type: ExtensionPackageType
  rootPath: string
  entryPath: string
  entryUrl: string
  styles: Array<Required<ExtensionAsset>>
  rules: ExtensionAsset[]
}

export interface WorkspaceExtensionWarning {
  source: string
  status: Exclude<ExtensionReferenceStatus, 'available'>
  reason: string
}

export interface WorkspaceExtensionReference {
  source: string
  kind: ExtensionReferenceKind
  status: ExtensionReferenceStatus
  reason?: string
  packagePath?: string
}

export interface WorkspaceExtensionManifest {
  mode: ExtensionMode
  workspaceRoot: string
  packages: WorkspaceExtensionPackage[]
  warnings: WorkspaceExtensionWarning[]
}

interface WorkspaceConfig {
  packages?: unknown
}

interface PackageJson {
  name?: unknown
  version?: unknown
  mdxforge?: unknown
}

interface MdxForgePackageConfig {
  schema?: unknown
  type?: unknown
  entry?: unknown
  styles?: unknown
  rules?: unknown
}

const workspaceConfigNames = ['mdxforge.config.json']
const supportedPackageTypes = new Set<ExtensionPackageType>([
  'component',
  'theme',
  'rules',
  'template',
  'transform',
  'resource'
])

export function readWorkspaceExtensionReferences(
  workspaceRoot: string
): WorkspaceExtensionReference[] {
  const resolvedRoot = resolve(workspaceRoot)
  const config = readWorkspaceConfig(resolvedRoot)
  const packageSources = Array.isArray(config.packages)
    ? config.packages.filter((item): item is string => typeof item === 'string')
    : []

  return packageSources.map((source) => resolveWorkspaceExtensionReference(resolvedRoot, source))
}

export function readWorkspaceExtensionManifest(workspaceRoot: string): WorkspaceExtensionManifest {
  const resolvedRoot = resolve(workspaceRoot)
  const references = readWorkspaceExtensionReferences(resolvedRoot)
  const packages: WorkspaceExtensionPackage[] = []
  const warnings: WorkspaceExtensionWarning[] = []

  for (const reference of references) {
    if (reference.status !== 'available' || !reference.packagePath) {
      warnings.push({
        source: reference.source,
        status: reference.status === 'available' ? 'invalid' : reference.status,
        reason: reference.reason ?? 'Extension package is not available.'
      })
      continue
    }

    const packageResult = readWorkspaceExtensionPackage(reference.packagePath)
    if (typeof packageResult === 'string') {
      warnings.push({
        source: reference.source,
        status: 'invalid',
        reason: packageResult
      })
      continue
    }

    packages.push(packageResult)
  }

  return {
    mode: 'safe',
    workspaceRoot: resolvedRoot,
    packages,
    warnings
  }
}

function readWorkspaceConfig(workspaceRoot: string): WorkspaceConfig {
  for (const fileName of workspaceConfigNames) {
    const filePath = join(workspaceRoot, fileName)
    if (!existsSync(filePath) || !statSync(filePath).isFile()) continue

    try {
      const value = JSON.parse(readFileSync(filePath, 'utf-8')) as WorkspaceConfig
      return typeof value === 'object' && value !== null ? value : {}
    } catch {
      return {}
    }
  }

  return {}
}

function resolveWorkspaceExtensionReference(
  workspaceRoot: string,
  source: string
): WorkspaceExtensionReference {
  if (source.startsWith('npm:')) {
    return unsupportedReference(source, 'npm')
  }

  if (source.startsWith('git:')) {
    return unsupportedReference(source, 'git')
  }

  if (!source.startsWith('.') && !isAbsolute(source)) {
    return unsupportedReference(source, 'unknown')
  }

  const packagePath = resolve(workspaceRoot, source)
  if (!isPathInside(workspaceRoot, packagePath)) {
    return {
      source,
      kind: 'workspace',
      status: 'blocked',
      reason: 'Package path must stay inside the workspace.'
    }
  }

  if (!existsSync(packagePath) || !statSync(packagePath).isDirectory()) {
    return {
      source,
      kind: 'workspace',
      status: 'missing',
      reason: 'Package folder does not exist.'
    }
  }

  return {
    source,
    kind: 'workspace',
    status: 'available',
    packagePath
  }
}

function unsupportedReference(
  source: string,
  kind: ExtensionReferenceKind
): WorkspaceExtensionReference {
  return {
    source,
    kind,
    status: 'unsupported',
    reason: 'Only workspace-local extension packages are supported in this version.'
  }
}

function readWorkspaceExtensionPackage(packagePath: string): WorkspaceExtensionPackage | string {
  const packageJsonPath = join(packagePath, 'package.json')
  if (!existsSync(packageJsonPath) || !statSync(packageJsonPath).isFile()) {
    return 'Extension package is missing package.json.'
  }

  let packageJson: PackageJson
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson
  } catch {
    return 'Extension package.json could not be parsed.'
  }

  if (typeof packageJson.name !== 'string' || packageJson.name.length === 0) {
    return 'Extension package.json must include a string name.'
  }

  const mdxforge = packageJson.mdxforge
  if (!isMdxForgePackageConfig(mdxforge)) {
    return 'Extension package.json must include an mdxforge object.'
  }

  const type = typeof mdxforge.type === 'string' ? mdxforge.type : 'component'
  if (!isExtensionPackageType(type)) {
    return `Unsupported extension package type: ${type}`
  }

  if (typeof mdxforge.entry !== 'string' || mdxforge.entry.length === 0) {
    return 'Extension package must define mdxforge.entry.'
  }

  const entryPath = resolvePackageAsset(packagePath, mdxforge.entry)
  if (!entryPath || !existsSync(entryPath) || !statSync(entryPath).isFile()) {
    return 'Extension entry file does not exist.'
  }

  const styles = readAssetList(mdxforge.styles)
    .map((asset) => resolvePackageAsset(packagePath, asset))
    .filter((asset): asset is string => Boolean(asset))
    .filter((asset) => existsSync(asset) && statSync(asset).isFile())
    .map((asset) => ({
      path: asset,
      url: toExtensionAssetUrl(packageJson.name as string, packagePath, asset)
    }))

  const rules = readAssetList(mdxforge.rules)
    .map((asset) => resolvePackageAsset(packagePath, asset))
    .filter((asset): asset is string => Boolean(asset))
    .filter((asset) => existsSync(asset) && statSync(asset).isFile())
    .map((asset) => ({ path: asset }))

  return {
    name: packageJson.name,
    version: typeof packageJson.version === 'string' ? packageJson.version : '0.0.0',
    type,
    rootPath: packagePath,
    entryPath,
    entryUrl: toExtensionAssetUrl(packageJson.name, packagePath, entryPath),
    styles,
    rules
  }
}

function isMdxForgePackageConfig(value: unknown): value is MdxForgePackageConfig {
  return typeof value === 'object' && value !== null
}

function isExtensionPackageType(value: string): value is ExtensionPackageType {
  return supportedPackageTypes.has(value as ExtensionPackageType)
}

function readAssetList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function resolvePackageAsset(packagePath: string, assetPath: string): string | null {
  const resolvedPath = resolve(packagePath, assetPath)
  return isPathInside(packagePath, resolvedPath) ? resolvedPath : null
}

function isPathInside(parentPath: string, childPath: string): boolean {
  const relativePath = relative(resolve(parentPath), resolve(childPath))
  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  )
}

function toExtensionAssetUrl(packageName: string, packagePath: string, assetPath: string): string {
  const safeName = encodeURIComponent(packageName)
  const relativeAssetPath = relative(packagePath, assetPath)
    .split(sep)
    .map(encodeURIComponent)
    .join('/')
  const prefix = relativeAssetPath.startsWith('/') ? '' : '/'
  return `mdxforge-extension://${safeName}${prefix}${relativeAssetPath}`
}

export function getWorkspaceExtensionAssetPath(
  manifest: WorkspaceExtensionManifest,
  url: string
): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  if (parsed.protocol !== 'mdxforge-extension:') return null

  const packageName = decodeURIComponent(parsed.hostname)
  const packageEntry = manifest.packages.find((item) => item.name === packageName)
  if (!packageEntry) return null

  const assetPath = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  const resolvedPath = resolve(packageEntry.rootPath, assetPath)
  return isPathInside(packageEntry.rootPath, resolvedPath) ? resolvedPath : null
}

export function getWorkspaceExtensionTrustKey(manifest: WorkspaceExtensionManifest): string {
  return `${manifest.workspaceRoot}\n${JSON.stringify(
    manifest.packages.map((extensionPackage) => ({
      entryUrl: extensionPackage.entryUrl,
      styles: extensionPackage.styles.map((style) => ({ url: style.url }))
    }))
  )}`
}
