# MDXForge

AI-native MDX docs workspace.

MDXForge lets AI write structured MDX documentation that is easier to read than plain Markdown, more token-efficient than HTML, and safer to render through a controlled component whitelist.

## Features

- Open local `.mdx` / `.md` files
- Render MDX with project-approved components
- Remember last opened directory
- Use a controlled MDX authoring rule set for AI-generated docs

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build:win
pnpm build:mac
pnpm build:linux
```

## Release

Releases are published to GitHub Releases. Create a version tag:

```bash
pnpm version patch
git push origin main --follow-tags
```

The release workflow builds Windows, macOS, and Linux artifacts. Auto updates use the same GitHub Release assets.

## MDX Rules

See `docs/mdx-authoring-rules.mdx`.

## Roadmap

See `docs/roadmap.mdx`.
