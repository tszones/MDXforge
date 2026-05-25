const assert = require('node:assert/strict')
const { mkdtempSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const jiti = require('jiti')

const requireTs = jiti(__filename, { interopDefault: true })
const { readWorkspaceSkills, createLocalSkill } = requireTs('../src/main/skills.ts')
const { upsertManagedBlock, removeManagedBlock } = requireTs('../src/main/skills/managed-block.ts')
const { previewAgentInstall, applyAgentInstall, previewAgentDisable, applyAgentDisable } =
  requireTs('../src/main/skills/projection.ts')
const { buildCanonicalRules, buildCompactAgentRules, buildCopyablePrompt } = requireTs(
  '../src/main/skills/rules.ts'
)

const root = mkdtempSync(join(tmpdir(), 'mdxforge-skills-'))
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
assert.equal(claudePreview.relativePath, 'CLAUDE.md')
assert.equal(claudePreview.action, 'create')
assert.match(claudePreview.diff, /Active MDXForge Writing Rules/)
applyAgentInstall(root, 'claude-code')
assert.match(readFileSync(join(root, 'CLAUDE.md'), 'utf-8'), /mdxforge:managed:start/)
writeFileSync(
  join(root, 'CLAUDE.md'),
  `User intro\n\n${readFileSync(join(root, 'CLAUDE.md'), 'utf-8')}\nUser outro\n`
)
const claudeUpdatePreview = previewAgentInstall(root, 'claude-code')
assert.equal(claudeUpdatePreview.action, 'update')
assert.match(claudeUpdatePreview.after, /User intro/)
assert.match(claudeUpdatePreview.after, /User outro/)
applyAgentInstall(root, 'claude-code')
assert.match(readFileSync(join(root, 'CLAUDE.md'), 'utf-8'), /User intro/)
assert.match(readFileSync(join(root, 'CLAUDE.md'), 'utf-8'), /User outro/)
const disablePreview = previewAgentDisable(root, 'claude-code')
assert.equal(disablePreview.action, 'update')
assert.doesNotMatch(disablePreview.after, /mdxforge:managed:start/)
applyAgentDisable(root, 'claude-code')
const disabledClaude = readFileSync(join(root, 'CLAUDE.md'), 'utf-8')
assert.doesNotMatch(disabledClaude, /mdxforge:managed:start/)
assert.match(disabledClaude, /User intro/)
assert.match(disabledClaude, /User outro/)

const cursorPreview = previewAgentInstall(root, 'cursor')
assert.equal(cursorPreview.relativePath, '.cursor/rules/mdxforge.mdc')
assert.equal(cursorPreview.action, 'create')

const codexPreview = previewAgentInstall(root, 'codex')
assert.equal(codexPreview.action, 'copy')
assert.match(codexPreview.after, /Active MDXForge Writing Rules/)

console.log('skills tests passed')
