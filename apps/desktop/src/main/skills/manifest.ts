import { existsSync, readFileSync, statSync } from 'fs'
import { join, relative, resolve, sep } from 'path'
import { type SkillCore, type SkillManifest, type SkillType, supportedSkillTypes } from './types'

interface PackageJson {
  name?: unknown
  version?: unknown
  description?: unknown
  mdxforge?: unknown
}

interface MdxForgeSkillConfig {
  type?: unknown
  types?: unknown
  title?: unknown
  rules?: unknown
  components?: unknown
}

interface RawSkillManifest {
  schema?: unknown
  name?: unknown
  title?: unknown
  version?: unknown
  description?: unknown
  types?: unknown
  rules?: unknown
  components?: unknown
  agentAdapters?: unknown
}

export function readLocalSkill(rootPath: string): SkillCore | string {
  const manifest = readSkillManifest(rootPath)
  if (typeof manifest === 'string') return manifest

  const rules = manifest.rules
    .map((rulePath) => resolveSkillAsset(rootPath, rulePath))
    .filter((rulePath): rulePath is string => Boolean(rulePath))
    .filter((rulePath) => existsSync(rulePath) && statSync(rulePath).isFile())
    .map((rulePath) => ({ path: rulePath, content: readFileSync(rulePath, 'utf-8') }))

  return {
    name: manifest.name,
    title: manifest.title,
    version: manifest.version,
    types: manifest.types,
    rules,
    components: manifest.components,
    permissions: permissionsForTypes(manifest.types)
  }
}

export function readSkillManifest(rootPath: string): SkillManifest | string {
  const manifestPath = join(rootPath, 'mdxforge.skill.json')
  if (existsSync(manifestPath) && statSync(manifestPath).isFile())
    return readManifestJson(manifestPath)

  return readLegacyPackageManifest(rootPath)
}

function readManifestJson(manifestPath: string): SkillManifest | string {
  let raw: RawSkillManifest
  try {
    raw = JSON.parse(readFileSync(manifestPath, 'utf-8')) as RawSkillManifest
  } catch {
    return 'mdxforge.skill.json could not be parsed.'
  }

  if (typeof raw.name !== 'string' || raw.name.length === 0) {
    return 'mdxforge.skill.json must include a string name.'
  }

  return {
    schema: typeof raw.schema === 'number' ? raw.schema : 1,
    name: raw.name,
    title: typeof raw.title === 'string' ? raw.title : raw.name,
    version: typeof raw.version === 'string' ? raw.version : '0.0.0',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    types: normalizeSkillTypes(raw),
    rules: readStringList(raw.rules),
    components: readStringList(raw.components),
    agentAdapters: readStringList(raw.agentAdapters)
  }
}

function readLegacyPackageManifest(rootPath: string): SkillManifest | string {
  const packagePath = join(rootPath, 'package.json')
  if (!existsSync(packagePath) || !statSync(packagePath).isFile()) {
    return 'Skill is missing mdxforge.skill.json or package.json.'
  }

  let packageJson: PackageJson
  try {
    packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as PackageJson
  } catch {
    return 'Skill package.json could not be parsed.'
  }

  if (typeof packageJson.name !== 'string' || packageJson.name.length === 0) {
    return 'Skill package.json must include a string name.'
  }

  const mdxforge = isSkillConfig(packageJson.mdxforge) ? packageJson.mdxforge : {}

  return {
    schema: 1,
    name: packageJson.name,
    title:
      typeof mdxforge.title === 'string'
        ? mdxforge.title
        : typeof packageJson.description === 'string'
          ? packageJson.description
          : packageJson.name,
    version: typeof packageJson.version === 'string' ? packageJson.version : '0.0.0',
    description: typeof packageJson.description === 'string' ? packageJson.description : undefined,
    types: normalizeSkillTypes(mdxforge),
    rules: readStringList(mdxforge.rules),
    components: readStringList(mdxforge.components),
    agentAdapters: []
  }
}

function isSkillConfig(value: unknown): value is MdxForgeSkillConfig {
  return typeof value === 'object' && value !== null
}

function normalizeSkillTypes(config: MdxForgeSkillConfig | RawSkillManifest): SkillType[] {
  const raw = readStringList(config.types)
  if ('type' in config && typeof config.type === 'string') raw.unshift(config.type)
  const types = [...new Set(raw)].filter((item): item is SkillType =>
    supportedSkillTypes.has(item as SkillType)
  )
  return types.length > 0 ? types : ['writing']
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function permissionsForTypes(types: SkillType[]): string[] {
  const permissions = new Set<string>()
  for (const type of types) {
    if (type === 'writing') permissions.add('Adds AI writing rules')
    if (type === 'component') permissions.add('Registers MDX components')
    if (type === 'template') permissions.add('Adds document templates')
    if (type === 'transform') permissions.add('Changes MDX compile behavior')
  }
  return [...permissions]
}

function resolveSkillAsset(rootPath: string, assetPath: string): string | null {
  const resolvedPath = resolve(rootPath, assetPath)
  return isPathInside(rootPath, resolvedPath) ? resolvedPath : null
}

function isPathInside(parentPath: string, childPath: string): boolean {
  const relativePath = relative(resolve(parentPath), resolve(childPath))
  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  )
}
