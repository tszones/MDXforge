import { dialog } from 'electron'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { basename, isAbsolute, join, relative, resolve, sep } from 'path'

export type SkillType = 'writing' | 'component' | 'template' | 'transform'
export type SkillSourceKind = 'workspace' | 'npm' | 'git' | 'unknown'
export type SkillStatus = 'active' | 'disabled' | 'missing' | 'invalid' | 'unsupported' | 'blocked'

export interface SkillRuleAsset {
  path: string
  content: string
}

export interface WorkspaceSkill {
  source: string
  kind: SkillSourceKind
  status: SkillStatus
  name: string
  title: string
  version: string
  types: SkillType[]
  rootPath?: string
  rules: SkillRuleAsset[]
  components: string[]
  permissions: string[]
  reason?: string
}

export interface WorkspaceSkillsState {
  workspaceRoot: string
  skills: WorkspaceSkill[]
  mergedRules: string
}

interface WorkspaceConfig {
  skills?: unknown
  packages?: unknown
  disabledSkills?: unknown
}

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

const configName = 'mdxforge.config.json'
const supportedTypes = new Set<SkillType>(['writing', 'component', 'template', 'transform'])

export function readWorkspaceSkills(workspaceRoot: string): WorkspaceSkillsState {
  const root = resolve(workspaceRoot)
  const config = readWorkspaceConfig(root)
  const sources = uniqueStrings([
    ...readStringList(config.skills),
    ...readStringList(config.packages)
  ])
  const disabled = new Set(readStringList(config.disabledSkills))
  const skills = sources.map((source) => readSkillReference(root, source, disabled.has(source)))

  return {
    workspaceRoot: root,
    skills,
    mergedRules: buildMergedRules(skills.filter((skill) => skill.status === 'active'))
  }
}

export async function addLocalSkillFolder(workspaceRoot: string): Promise<WorkspaceSkillsState | null> {
  const result = await dialog.showOpenDialog({
    title: 'Add local MDXForge skill',
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const root = resolve(workspaceRoot)
  const folderPath = resolve(result.filePaths[0])
  if (!isPathInside(root, folderPath)) {
    throw new Error('Skill folder must be inside the current workspace.')
  }

  const source = `./${relative(root, folderPath).split(sep).join('/')}`
  const config = readWorkspaceConfig(root)
  const skills = uniqueStrings([...readStringList(config.skills), source])
  writeWorkspaceConfig(root, { ...config, skills })
  return readWorkspaceSkills(root)
}

export function createLocalSkill(
  workspaceRoot: string,
  inputName: string,
  type: SkillType = 'writing'
): WorkspaceSkillsState {
  const root = resolve(workspaceRoot)
  const slug = slugifySkillName(inputName)
  if (!slug) throw new Error('Skill name is required.')
  if (!supportedTypes.has(type)) throw new Error(`Unsupported skill type: ${type}`)

  const skillRoot = join(root, '.mdxforge', 'skills', slug)
  if (existsSync(skillRoot)) throw new Error(`Skill already exists: ${slug}`)

  mkdirSync(skillRoot, { recursive: true })
  if (type === 'component') mkdirSync(join(skillRoot, 'src'), { recursive: true })

  writeFileSync(
    join(skillRoot, 'package.json'),
    `${JSON.stringify(createSkillPackageJson(slug, type), null, 2)}\n`,
    'utf-8'
  )
  writeFileSync(join(skillRoot, 'rules.mdx'), createSkillRules(slug, type), 'utf-8')
  writeFileSync(join(skillRoot, 'demo.mdx'), createSkillDemo(slug, type), 'utf-8')
  if (type === 'component') {
    writeFileSync(join(skillRoot, 'src', 'extension.tsx'), createComponentSkillSource(slug), 'utf-8')
  }

  const source = `./${relative(root, skillRoot).split(sep).join('/')}`
  const config = readWorkspaceConfig(root)
  const skills = uniqueStrings([...readStringList(config.skills), source])
  writeWorkspaceConfig(root, { ...config, skills })
  return readWorkspaceSkills(root)
}

function readSkillReference(workspaceRoot: string, source: string, disabled: boolean): WorkspaceSkill {
  if (source.startsWith('npm:')) return placeholderSkill(source, 'npm', 'unsupported', 'npm install is not supported yet.')
  if (source.startsWith('git:')) return placeholderSkill(source, 'git', 'unsupported', 'git install is not supported yet.')
  if (!source.startsWith('.') && !isAbsolute(source)) {
    return placeholderSkill(source, 'unknown', 'unsupported', 'Only workspace-local skills are supported yet.')
  }

  const rootPath = resolve(workspaceRoot, source)
  if (!isPathInside(workspaceRoot, rootPath)) {
    return placeholderSkill(source, 'workspace', 'blocked', 'Skill path must stay inside the workspace.')
  }
  if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) {
    return placeholderSkill(source, 'workspace', 'missing', 'Skill folder does not exist.')
  }

  const parsed = readLocalSkill(rootPath)
  if (typeof parsed === 'string') return placeholderSkill(source, 'workspace', 'invalid', parsed, rootPath)

  return {
    ...parsed,
    source,
    kind: 'workspace',
    status: disabled ? 'disabled' : 'active',
    rootPath
  }
}

function readLocalSkill(rootPath: string): Omit<WorkspaceSkill, 'source' | 'kind' | 'status'> | string {
  const packagePath = join(rootPath, 'package.json')
  if (!existsSync(packagePath) || !statSync(packagePath).isFile()) {
    return 'Skill is missing package.json.'
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
  const types = normalizeSkillTypes(mdxforge)
  const rulePaths = readStringList(mdxforge.rules)
  const rules = rulePaths
    .map((rulePath) => resolveSkillAsset(rootPath, rulePath))
    .filter((rulePath): rulePath is string => Boolean(rulePath))
    .filter((rulePath) => existsSync(rulePath) && statSync(rulePath).isFile())
    .map((rulePath) => ({ path: rulePath, content: readFileSync(rulePath, 'utf-8') }))

  return {
    name: packageJson.name,
    title:
      typeof mdxforge.title === 'string'
        ? mdxforge.title
        : typeof packageJson.description === 'string'
          ? packageJson.description
          : packageJson.name,
    version: typeof packageJson.version === 'string' ? packageJson.version : '0.0.0',
    types,
    rules,
    components: readStringList(mdxforge.components),
    permissions: permissionsForTypes(types)
  }
}

function placeholderSkill(
  source: string,
  kind: SkillSourceKind,
  status: Exclude<SkillStatus, 'active' | 'disabled'>,
  reason: string,
  rootPath?: string
): WorkspaceSkill {
  return {
    source,
    kind,
    status,
    name: source,
    title: source,
    version: '0.0.0',
    rootPath,
    types: [],
    rules: [],
    components: [],
    permissions: [],
    reason
  }
}

function buildMergedRules(skills: WorkspaceSkill[]): string {
  const sections = skills
    .filter((skill) => skill.rules.length > 0)
    .map((skill) => {
      const body = skill.rules.map((rule) => rule.content.trim()).filter(Boolean).join('\n\n')
      return body ? `## ${skill.title}\n\nSource: ${skill.source}\n\n${body}` : ''
    })
    .filter(Boolean)

  return [
    '# Active MDXForge Writing Rules',
    '',
    '## Core Rules',
    '',
    '- Do not write import or export in MDX.',
    '- Use only registered components.',
    '- Prefer Markdown for prose.',
    '- Avoid arbitrary HTML and script tags.',
    '',
    ...sections
  ]
    .join('\n')
    .trim()
}

function createSkillPackageJson(slug: string, type: SkillType): Record<string, unknown> {
  return {
    name: slug,
    private: true,
    version: '0.0.0',
    description: titleFromSlug(slug),
    mdxforge: {
      schema: 1,
      title: titleFromSlug(slug),
      types: [type],
      rules: ['./rules.mdx'],
      components: type === 'component' ? ['ExampleCard'] : []
    }
  }
}

function createSkillRules(slug: string, type: SkillType): string {
  const title = titleFromSlug(slug)
  const componentRules =
    type === 'component'
      ? '\n## Components\n\n### ExampleCard\n\nUse `<ExampleCard />` to highlight a small example or key idea. Keep the content short.\n'
      : ''

  return `---\ntitle: ${title} Rules\ndescription: AI writing rules for ${title}.\n---\n\n# ${title} Rules\n\nUse this skill when writing MDXForge-compatible documents for this workspace.\n\n## General Rules\n\n- Prefer Markdown for prose.\n- Do not write import or export statements.\n- Use only components registered by this workspace.\n${componentRules}`
}

function createSkillDemo(slug: string, type: SkillType): string {
  const title = titleFromSlug(slug)
  const componentExample =
    type === 'component'
      ? '\n\n<ExampleCard title="Example">\n  This card is provided by the local skill.\n</ExampleCard>\n'
      : ''

  return `---\ntitle: ${title} Demo\ndescription: Demo document for ${title}.\n---\n\n# ${title} Demo\n\nThis document shows how the skill should be used.${componentExample}`
}

function createComponentSkillSource(slug: string): string {
  const title = titleFromSlug(slug)
  return `import type { ReactNode } from 'react'\n\nexport default {\n  name: '${slug}',\n  version: '0.0.0',\n  components: {\n    ExampleCard\n  }\n}\n\nfunction ExampleCard({ title = '${title}', children }: { title?: string; children?: ReactNode }) {\n  return (\n    <section style={{ border: '1px solid var(--color-fd-border)', borderRadius: 12, padding: 16 }}>\n      <strong>{title}</strong>\n      <div>{children}</div>\n    </section>\n  )\n}\n`
}

function slugifySkillName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function readWorkspaceConfig(workspaceRoot: string): WorkspaceConfig {
  const configPath = join(workspaceRoot, configName)
  if (!existsSync(configPath) || !statSync(configPath).isFile()) return {}

  try {
    const value = JSON.parse(readFileSync(configPath, 'utf-8')) as WorkspaceConfig
    return typeof value === 'object' && value !== null ? value : {}
  } catch {
    return {}
  }
}

function writeWorkspaceConfig(workspaceRoot: string, config: WorkspaceConfig): void {
  mkdirSync(workspaceRoot, { recursive: true })
  writeFileSync(join(workspaceRoot, configName), `${JSON.stringify(config, null, 2)}\n`, 'utf-8')
}

function isSkillConfig(value: unknown): value is MdxForgeSkillConfig {
  return typeof value === 'object' && value !== null
}

function normalizeSkillTypes(config: MdxForgeSkillConfig): SkillType[] {
  const raw = readStringList(config.types)
  if (typeof config.type === 'string') raw.unshift(config.type)
  const types = uniqueStrings(raw).filter((item): item is SkillType => supportedTypes.has(item as SkillType))
  return types.length > 0 ? types : ['writing']
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
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

export function getDefaultLocalSkillName(workspaceRoot: string): string {
  return basename(workspaceRoot) || 'local-skill'
}
