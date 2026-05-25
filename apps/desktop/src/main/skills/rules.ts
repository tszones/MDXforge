import type { AgentId, SkillCore } from './types'

export function buildCanonicalRules(skill: SkillCore): string {
  return skill.rules
    .map((rule) => rule.content.trim())
    .filter(Boolean)
    .join('\n\n')
}

export function buildCompactAgentRules(skill: SkillCore, agentId: AgentId): string {
  const componentList = skill.components.length > 0 ? skill.components.join(', ') : 'Markdown only'

  return [
    '# Active MDXForge Writing Rules',
    '',
    `Skill: ${skill.title} (${skill.version})`,
    `Agent: ${agentId}`,
    '',
    'Write local MDX/Markdown for MDXForge preview.',
    '',
    '## Must',
    '- Include frontmatter title and optional description.',
    '- Prefer Markdown for prose, lists, tables, images, and code fences.',
    '- Use only MDXForge whitelisted components.',
    '- Keep docs readable, structured, reviewable.',
    '',
    '## Components',
    componentList,
    '',
    '## Never',
    '- No imports or exports.',
    '- No custom React components.',
    '- No arbitrary JS expressions, browser globals, fetch, eval, or scripts.',
    '- No unknown JSX tags.',
    '',
    '## Output checklist',
    '- MDX compiles locally.',
    '- Headings are hierarchical.',
    '- Code blocks have languages.',
    '- Props are simple and explicit.',
    '',
    'For full component details, open the MDXForge Skill files or MDXForge docs.'
  ].join('\n')
}

export function buildCopyablePrompt(skill: SkillCore): string {
  return [
    '# MDXForge AI Writing Rules',
    '',
    buildCanonicalRules(skill),
    '',
    'Before final output, verify the document follows the MDXForge checklist.'
  ].join('\n')
}
