---
name: mdxforge-mdx
summary: Write MDXForge-compatible MDX docs using the official component whitelist.
version: 0.1.0
---

# MDXForge MDX Skill

Use this skill when creating or editing documentation intended for MDXForge.

MDXForge docs use MDX by default. Output complete `.mdx` files that follow the official component whitelist and avoid arbitrary runtime code.

## Core Rules

- Include frontmatter with `title` and preferably `description`.
- Use Markdown for normal prose.
- Use only supported MDXForge components.
- Do not write `import` / `export`.
- Do not define custom React components.
- Do not use arbitrary JS expressions such as `{fetch(...)}` or `{window...}`.
- Put code samples in fenced code blocks with a language.
- If unsure whether a component exists, use plain Markdown.

## Frontmatter

```mdx
---
title: Document Title
description: One sentence summary.
---
```

## Supported Components

### Callout

Use for notes, warnings, errors, tips, constraints.

```mdx
<Callout title="Note" type="info">
Important information.
</Callout>
```

Common `type` values:

- `info`
- `warn`
- `error`

### Cards / Card

Use for resource links, option groups, related docs.

```mdx
<Cards>
  <Card title="Quick Start" href="https://example.com">
    Read the quick start guide.
  </Card>
</Cards>
```

Rules:

- `Card` must include `title`.
- `href` is optional.
- Put `Card` inside `Cards`.

### CodeBlockTabs / CodeBlockTab / CodeBlockTabsList / CodeBlockTabsTrigger

Use for equivalent commands or variants.

```mdx
<CodeBlockTabs defaultValue="pnpm">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="pnpm">pnpm</CodeBlockTabsTrigger>
    <CodeBlockTabsTrigger value="npm">npm</CodeBlockTabsTrigger>
  </CodeBlockTabsList>
  <CodeBlockTab value="pnpm">

```bash
pnpm install
```

  </CodeBlockTab>
  <CodeBlockTab value="npm">

```bash
npm install
```

  </CodeBlockTab>
</CodeBlockTabs>
```

## Normal Markdown Elements

MDXForge supports enhanced rendering for:

- headings: `#`, `##`, `###`, `####`, `#####`, `######`
- links
- images
- tables
- code blocks

Prefer Markdown syntax instead of JSX for these.

## Temporary Fallback Components

The renderer accepts these names but currently renders fallback placeholders:

- `Accordion`
- `Accordions`
- `Step`
- `Steps`
- `File`
- `Files`
- `Tabs`
- `Tab`

Only use them if the user explicitly asks. Otherwise use Markdown.

## Forbidden

Never output:

```mdx
import X from './x'
export const x = {}
function MyComponent() { return <div /> }
<UnknownComponent />
{fetch('/api')}
{window.location.href}
```

## Default Template

```mdx
---
title: Title
description: One sentence summary.
---

# Title

Intro paragraph.

<Callout title="Note" type="info">
Important context.
</Callout>

## Section

Content.

```ts
console.log('example')
```
```
