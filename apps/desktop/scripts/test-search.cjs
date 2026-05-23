const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { readMdxFolder } = jiti('../src/main/page-tree.ts')
const { searchMdxWorkspaceFiles } = jiti('../src/main/workspace-search.ts')
const { filterFileEntries, getTextMatches } = jiti('../src/renderer/src/lib/search-model.ts')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdxforge-search-'))

function write(relativePath, content) {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

try {
  write('index.mdx', '---\ntitle: Home\n---\n\n# Home\n\nWorkspace Needle starts here.\n')
  write(
    'guide/setup.mdx',
    [
      '---',
      'title: Install Guide',
      'description: Setup reference',
      '---',
      '',
      '# Setup',
      '',
      'The second workspace needle is on this line.',
      'Needle also appears again.'
    ].join('\n')
  )
  write('notes.mdx', '---\ntitle: Notes\n---\n\n# Notes\n\nNothing relevant.\n')

  const folder = readMdxFolder(root)
  const workspaceResults = searchMdxWorkspaceFiles(folder.files, 'workspace needle')

  assert.deepEqual(
    workspaceResults.map((result) => result.relativePath),
    ['guide/setup.mdx', 'index.mdx']
  )
  const indexResult = workspaceResults.find((result) => result.relativePath === 'index.mdx')
  assert.ok(indexResult)
  assert.equal(indexResult.matches[0].line, 7)
  assert.equal(indexResult.matches[0].column, 1)
  assert.match(indexResult.matches[0].preview, /Workspace Needle/)

  const titleResults = filterFileEntries(folder.files, 'install')
  assert.equal(titleResults[0].relativePath, 'guide/setup.mdx')
  assert.equal(titleResults[0].title, 'Install Guide')

  const pathResults = filterFileEntries(folder.files, 'notes')
  assert.equal(pathResults[0].relativePath, 'notes.mdx')

  const textMatches = getTextMatches('Alpha beta alpha\nNo match\nALPHA again', 'alpha')
  assert.deepEqual(
    textMatches.map((match) => ({ line: match.line, column: match.column })),
    [
      { line: 1, column: 1 },
      { line: 1, column: 12 },
      { line: 3, column: 1 }
    ]
  )

  console.log('PASS search')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
