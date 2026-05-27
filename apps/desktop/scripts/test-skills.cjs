const assert = require('node:assert/strict')
const { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const jiti = require('jiti')

const root = mkdtempSync(join(tmpdir(), 'mdxforge-skills-'))
process.env.MDXFORGE_SKILLS_HOME = root

const requireTs = jiti(__filename, { interopDefault: true })
const { readWorkspaceSkills, createLocalSkill } = requireTs('../src/main/skills.ts')
const { upsertManagedBlock, removeManagedBlock } = requireTs('../src/main/skills/managed-block.ts')
const { previewAgentInstall, applyAgentInstall, previewAgentDisable, applyAgentDisable } =
  requireTs('../src/main/skills/projection.ts')
const { buildCanonicalRules, buildCompactAgentRules, buildCopyablePrompt } = requireTs(
  '../src/main/skills/rules.ts'
)

const skillRoot = join(root, 'skills', 'demo')
mkdirSync(skillRoot, { recursive: true })
writeFileSync(join(root, 'mdxforge.config.json'), JSON.stringify({ skills: ['./skills/demo'] }))
writeFileSync(
  join(skillRoot, 'mdxforge.skill.json'),
  JSON.stringify({
    schema: 1,
    name: 'demo',
    title: 'Demo Skill',
    version: '1.2.3',
    types: ['writing'],
    rules: ['./SKILL.md'],
    components: ['Callout']
  })
)
writeFileSync(join(skillRoot, 'SKILL.md'), '# Demo\n\n- Use Callout.')

const state = readWorkspaceSkills(root)
assert.equal(state.skills.length, 2)
const localSkill = state.skills.find((skill) => skill.name === 'demo')
assert.ok(localSkill)
assert.equal(localSkill.version, '1.2.3')
assert.deepEqual(localSkill.components, ['Callout'])
assert.match(state.mergedRules, /Use Callout/)
assert.match(buildCanonicalRules(localSkill), /Use Callout/)
assert.match(buildCompactAgentRules(localSkill, 'claude-code'), /Agent: claude-code/)
assert.match(buildCopyablePrompt(localSkill), /MDXForge AI Writing Rules/)

const createdRoot = join(root, '.mdxforge', 'skills', 'generated-skill')
createLocalSkill(root, 'Generated Skill', 'writing')
assert.match(readFileSync(join(createdRoot, 'mdxforge.skill.json'), 'utf-8'), /"rules"/)
assert.match(readFileSync(join(createdRoot, 'SKILL.md'), 'utf-8'), /Generated Skill Rules/)

const upserted = upsertManagedBlock('Intro\n', 'Rules')
assert.equal(upserted.conflict, false)
assert.match(upserted.content, /mdxforge:managed:start/)
assert.match(upserted.content, /Rules/)
const removed = removeManagedBlock(upserted.content)
assert.equal(removed.conflict, false)
assert.equal(removed.content, 'Intro\n')
const replaced = upsertManagedBlock(upserted.content, 'New Rules')
assert.equal(replaced.conflict, false)
assert.match(replaced.content, /New Rules/)
assert.doesNotMatch(replaced.content, /\nRules\n/)
assert.equal(upsertManagedBlock('<!-- mdxforge:managed:start -->', 'Rules').conflict, true)

const claudePreview = previewAgentInstall(root, 'claude-code')
assert.equal(claudePreview.kind, 'directory')
assert.equal(
  claudePreview.relativePath.replaceAll('\\\\', '/').endsWith('/.claude/skills/mdxforge-mdx'),
  true
)
assert.equal(claudePreview.action, 'create')
assert.match(claudePreview.after, /SKILL\.md/)
applyAgentInstall(root, 'claude-code')
assert.match(
  readFileSync(join(root, '.claude', 'skills', 'mdxforge-mdx', 'SKILL.md'), 'utf-8'),
  /MDXForge MDX Skill/
)
assert.equal(
  readFileSync(join(root, '.claude', 'skills', 'mdxforge-mdx', 'components', 'callout.md'), 'utf-8')
    .length > 0,
  true
)
const claudeUpdatePreview = previewAgentInstall(root, 'claude-code')
assert.equal(claudeUpdatePreview.action, 'update')
const disablePreview = previewAgentDisable(root, 'claude-code')
assert.equal(disablePreview.kind, 'directory')
assert.equal(disablePreview.action, 'delete')
applyAgentDisable(root, 'claude-code')
assert.equal(existsSync(join(root, '.claude', 'skills', 'mdxforge-mdx', 'SKILL.md')), false)

const cursorPreview = previewAgentInstall(root, 'cursor')
assert.equal(
  cursorPreview.relativePath.replaceAll('\\\\', '/').endsWith('/.cursor/skills/mdxforge-mdx'),
  true
)
assert.equal(cursorPreview.kind, 'directory')
assert.equal(cursorPreview.action, 'create')
applyAgentInstall(root, 'cursor')
assert.match(
  readFileSync(join(root, '.cursor', 'skills', 'mdxforge-mdx', 'SKILL.md'), 'utf-8'),
  /MDXForge MDX Skill/
)

const codexPreview = previewAgentInstall(root, 'codex')
assert.equal(
  codexPreview.relativePath.replaceAll('\\\\', '/').endsWith('/.agents/skills/mdxforge-mdx'),
  true
)
assert.equal(codexPreview.kind, 'directory')
assert.equal(codexPreview.action, 'create')
applyAgentInstall(root, 'codex')
assert.match(
  readFileSync(join(root, '.agents', 'skills', 'mdxforge-mdx', 'SKILL.md'), 'utf-8'),
  /MDXForge MDX Skill/
)
assert.equal(existsSync(join(root, '.agents', 'skills', 'mdxforge-mdx', 'patterns')), true)

const openclawPreview = previewAgentInstall(root, 'openclaw')
assert.equal(
  openclawPreview.relativePath
    .replaceAll('\\\\', '/')
    .endsWith('/.openclaw/skills/mdxforge/mdxforge-mdx'),
  true
)
assert.equal(openclawPreview.kind, 'directory')
assert.equal(openclawPreview.action, 'create')

console.log('skills tests passed')
