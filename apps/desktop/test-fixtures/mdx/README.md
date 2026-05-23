# MDXForge MDX Test Fixtures

Use these files to manually verify MDXForge rendering behavior.

## Positive Fixtures

- `01-basic-markdown.mdx` — Markdown basics.
- `02-callouts.mdx` — `Callout` variants.
- `03-cards.mdx` — `Cards` / `Card`.
- `04-code-blocks.mdx` — fenced code blocks and code tabs.
- `05-fallback-components.mdx` — tolerated fallback components.
- `06-mixed-document.mdx` — realistic AI-generated document.
- `07-edge-cases.mdx` — escaping, unicode, long text, inline HTML.

## Negative Fixtures

- `99-invalid-closing-tag.mdx` — intentionally uses a closing JSX tag without an opener.
- `99-invalid-html-closing-slash.mdx` — intentionally uses invalid HTML-style `</br>` syntax.
- `99-invalid-mismatched-tags.mdx` — intentionally opens one component and closes another.
- `99-invalid-unknown-component.mdx` — intentionally uses `UnknownComponent`; should fail or show a controlled render error.
- `99-invalid-unescaped-angle-text.mdx` — intentionally leaves angle-bracket prose unescaped.
- `99-invalid-unterminated-component.mdx` — intentionally leaves a component unclosed.

## Manual Test Flow

1. Run MDXForge.
2. Open each positive fixture.
3. Verify no crash.
4. Verify component styling appears.
5. Open the negative fixture.
6. Verify the error is readable and controlled.
