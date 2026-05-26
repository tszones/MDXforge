---
name: mdxforge-mdx
description: Write or edit MDXForge-compatible MDX docs using the official component whitelist and authoring rules.
version: 0.1.0
---

# MDXForge MDX Skill

Use this skill when creating or editing `.mdx` documents for MDXForge.

## Required Behavior

- Output complete MDX documents when the user asks for a file.
- Include frontmatter with `title` and preferably `description`.
- Use Markdown for prose, headings, links, lists, images, tables, and code fences.
- Use only MDXForge registered components listed in this skill package.
- Do not write `import` or `export` statements.
- Do not define React components inside MDX.
- Do not use arbitrary runtime JavaScript expressions such as `{fetch(...)}` or `{window...}`.
- If a component is not documented here, use plain Markdown.

## Companion Rules

Read the relevant companion files before using specialized components:

- `patterns/document-structure.md` for document layout.
- `checklists/preflight.md` before final output.
- `components/callout.md` for `Callout` / `Banner`.
- `components/cards.md` for `Cards` / `Card`.
- `components/code.md` for code blocks and code tabs.
- `components/images.md` for images and `ImageZoom`.
- `components/tables.md` for Markdown tables and `TypeTable`.
- `components/steps.md`, `tabs.md`, `accordion.md`, `files.md`, `mermaid.md`, `charts.md`, `todo.md`, `github-info.md`, `inline-toc.md` for those features.

## Default Template

````mdx
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
````

## Forbidden Examples

````mdx
import X from './x'
export const x = {}
function MyComponent() { return <div /> }
<UnknownComponent />
{fetch('/api')}
{window.location.href}
````