# Docuforge MDX Test Fixtures

Use these files to manually verify Docuforge rendering behavior.

## Positive Fixtures

- `01-basic-markdown.mdx` — Markdown basics.
- `02-callouts.mdx` — `Callout` variants.
- `03-cards.mdx` — `Cards` / `Card`.
- `04-code-blocks.mdx` — fenced code blocks and code tabs.
- `05-fallback-components.mdx` — tolerated fallback components.
- `06-mixed-document.mdx` — realistic AI-generated document.
- `07-edge-cases.mdx` — escaping, unicode, long text, inline HTML.

## Negative Fixtures

- `99-invalid-unknown-component.mdx` — intentionally uses `UnknownComponent`; should fail or show a controlled error until unknown-component fallback exists.

## Manual Test Flow

1. Run Docuforge.
2. Open each positive fixture.
3. Verify no crash.
4. Verify component styling appears.
5. Open the negative fixture.
6. Verify the error is readable and controlled.
