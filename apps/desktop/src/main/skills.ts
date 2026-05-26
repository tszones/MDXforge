import { dialog } from 'electron'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { basename, isAbsolute, join, relative, resolve, sep } from 'path'
import { readLocalSkill } from './skills/manifest'
import { buildCopyablePrompt } from './skills/rules'
import {
  type SkillSourceKind,
  type SkillStatus,
  type SkillType,
  supportedSkillTypes,
  type WorkspaceSkill,
  type WorkspaceSkillsState
} from './skills/types'

export type { SkillType, WorkspaceSkill, WorkspaceSkillsState } from './skills/types'

interface WorkspaceConfig {
  skills?: unknown
  packages?: unknown
  disabledSkills?: unknown
}

const configName = 'mdxforge.config.json'

export function readWorkspaceSkills(workspaceRoot: string): WorkspaceSkillsState {
  const root = resolve(workspaceRoot)
  const config = readWorkspaceConfig(root)
  const sources = uniqueStrings([
    'builtin:mdxforge-mdx',
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

export async function addLocalSkillFolder(
  workspaceRoot: string
): Promise<WorkspaceSkillsState | null> {
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
  if (!supportedSkillTypes.has(type)) throw new Error(`Unsupported skill type: ${type}`)

  const skillRoot = join(root, '.mdxforge', 'skills', slug)
  if (existsSync(skillRoot)) throw new Error(`Skill already exists: ${slug}`)

  mkdirSync(skillRoot, { recursive: true })
  if (type === 'component') mkdirSync(join(skillRoot, 'src'), { recursive: true })

  writeFileSync(
    join(skillRoot, 'mdxforge.skill.json'),
    `${JSON.stringify(createSkillManifestJson(slug, type), null, 2)}\n`,
    'utf-8'
  )
  writeFileSync(join(skillRoot, 'SKILL.md'), createSkillRules(slug, type), 'utf-8')
  writeFileSync(join(skillRoot, 'demo.mdx'), createSkillDemo(slug, type), 'utf-8')
  if (type === 'component') {
    writeFileSync(
      join(skillRoot, 'src', 'extension.tsx'),
      createComponentSkillSource(slug),
      'utf-8'
    )
  }

  const source = `./${relative(root, skillRoot).split(sep).join('/')}`
  const config = readWorkspaceConfig(root)
  const skills = uniqueStrings([...readStringList(config.skills), source])
  writeWorkspaceConfig(root, { ...config, skills })
  return readWorkspaceSkills(root)
}

function readSkillReference(
  workspaceRoot: string,
  source: string,
  disabled: boolean
): WorkspaceSkill {
  if (source === 'builtin:mdxforge-mdx') {
    const rootPath = resolveBuiltinSkillPath()
    const parsed = readLocalSkill(rootPath)
    if (typeof parsed === 'string')
      return placeholderSkill(source, 'builtin', 'invalid', parsed, rootPath)
    return {
      ...parsed,
      source,
      kind: 'builtin',
      status: disabled ? 'disabled' : 'active',
      rootPath
    }
  }
  if (source.startsWith('npm:')) {
    return placeholderSkill(source, 'npm', 'unsupported', 'npm install is not supported yet.')
  }
  if (source.startsWith('git:')) {
    return placeholderSkill(source, 'git', 'unsupported', 'git install is not supported yet.')
  }
  if (!source.startsWith('.') && !isAbsolute(source)) {
    return placeholderSkill(
      source,
      'unknown',
      'unsupported',
      'Only workspace-local skills are supported yet.'
    )
  }

  const rootPath = resolve(workspaceRoot, source)
  if (!isPathInside(workspaceRoot, rootPath)) {
    return placeholderSkill(
      source,
      'workspace',
      'blocked',
      'Skill path must stay inside the workspace.'
    )
  }
  if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) {
    return placeholderSkill(source, 'workspace', 'missing', 'Skill folder does not exist.')
  }

  const parsed = readLocalSkill(rootPath)
  if (typeof parsed === 'string')
    return placeholderSkill(source, 'workspace', 'invalid', parsed, rootPath)

  return {
    ...parsed,
    source,
    kind: 'workspace',
    status: disabled ? 'disabled' : 'active',
    rootPath
  }
}

function resolveBuiltinSkillPath(): string {
  const candidates = [
    resolve(process.cwd(), 'skills', 'mdxforge-mdx'),
    resolve(process.cwd(), '..', '..', 'skills', 'mdxforge-mdx'),
    resolve(__dirname, '..', '..', '..', '..', 'skills', 'mdxforge-mdx'),
    resolve(__dirname, '..', '..', '..', '..', '..', 'skills', 'mdxforge-mdx')
  ]
  return (
    candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isDirectory()) ??
    candidates[0]
  )
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
    .map(buildCopyablePrompt)
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

function createSkillManifestJson(slug: string, type: SkillType): Record<string, unknown> {
  return {
    schema: 1,
    name: slug,
    title: titleFromSlug(slug),
    version: '0.0.0',
    description: `${titleFromSlug(slug)} local skill.`,
    types: [type],
    rules: ['./SKILL.md'],
    components: type === 'component' ? ['ExampleCard'] : [],
    agentAdapters: ['claude-code', 'cursor', 'codex']
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

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
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
