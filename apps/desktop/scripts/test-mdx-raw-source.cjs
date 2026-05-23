const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { readMdxRawSource } = jiti('../src/main/mdx-raw-source.ts')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdxforge-raw-source-'))

try {
  const source = [
    '---',
    'title: Raw Source',
    '---',
    '',
    '# Heading',
    '',
    '<Callout>Keep the original MDX source.</Callout>',
    ''
  ].join('\r\n')
  const filePath = path.join(root, 'source.mdx')
  fs.writeFileSync(filePath, source, 'utf8')

  assert.equal(readMdxRawSource(filePath), source)

  console.log('PASS mdx raw source')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
