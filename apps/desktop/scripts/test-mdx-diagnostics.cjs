const assert = require('node:assert/strict')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { findMdxCompileDiagnostic } = jiti('../src/main/mdx-diagnostics.ts')

const htmlCommentSource = ['# Title', '', '<!-- draft note -->', ''].join('\n')
assert.deepEqual(findMdxCompileDiagnostic(htmlCommentSource), {
  kind: 'html-comment',
  line: 3,
  column: 1,
  snippet: '<!-- draft note -->'
})

const fencedHtmlCommentSource = ['# Title', '', '```html', '<!-- legal sample -->', '```'].join('\n')
assert.equal(findMdxCompileDiagnostic(fencedHtmlCommentSource), null)

const doctypeSource = ['# HTML sample', '', '<!DOCTYPE html>'].join('\n')
assert.deepEqual(findMdxCompileDiagnostic(doctypeSource), {
  kind: 'html-declaration',
  line: 3,
  column: 1,
  snippet: '<!DOCTYPE html>'
})

console.log('PASS mdx diagnostics')
