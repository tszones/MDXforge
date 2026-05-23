const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { readWorkspaceExtensionManifest, readWorkspaceExtensionReferences } = jiti(
  '../src/main/extensions.ts'
)

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdxforge-extensions-'))

function write(relativePath, content) {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

try {
  write(
    'mdxforge.config.json',
    JSON.stringify({
      packages: [
        './.mdxforge/extensions/local-dashboard',
        '../outside-extension',
        'npm:@acme/remote'
      ]
    })
  )
  write(
    '.mdxforge/extensions/local-dashboard/package.json',
    JSON.stringify({
      name: 'local-dashboard',
      version: '0.0.0',
      private: true,
      mdxforge: {
        schema: 1,
        type: 'component',
        entry: './dist/extension.js',
        styles: ['./dist/style.css'],
        rules: ['./rules.mdx']
      }
    })
  )
  write('.mdxforge/extensions/local-dashboard/dist/extension.js', 'export default {}')
  write('.mdxforge/extensions/local-dashboard/dist/style.css', '.metric-card {}')
  write('.mdxforge/extensions/local-dashboard/rules.mdx', '# Local Dashboard Rules')

  const references = readWorkspaceExtensionReferences(root)

  assert.deepEqual(
    references.map((reference) => ({
      source: reference.source,
      status: reference.status,
      kind: reference.kind,
      reason: reference.reason
    })),
    [
      {
        source: './.mdxforge/extensions/local-dashboard',
        status: 'available',
        kind: 'workspace',
        reason: undefined
      },
      {
        source: '../outside-extension',
        status: 'blocked',
        kind: 'workspace',
        reason: 'Package path must stay inside the workspace.'
      },
      {
        source: 'npm:@acme/remote',
        status: 'unsupported',
        kind: 'npm',
        reason: 'Only workspace-local extension packages are supported in this version.'
      }
    ]
  )

  const manifest = readWorkspaceExtensionManifest(root)

  assert.equal(manifest.mode, 'safe')
  assert.equal(manifest.workspaceRoot, root)
  assert.equal(manifest.packages.length, 1)
  assert.equal(manifest.packages[0].name, 'local-dashboard')
  assert.equal(manifest.packages[0].version, '0.0.0')
  assert.equal(manifest.packages[0].type, 'component')
  assert.equal(
    manifest.packages[0].entryPath,
    path.join(root, '.mdxforge/extensions/local-dashboard/dist/extension.js')
  )
  assert.equal(
    manifest.packages[0].entryUrl,
    'mdxforge-extension://local-dashboard/dist/extension.js'
  )
  assert.deepEqual(manifest.packages[0].styles, [
    {
      path: path.join(root, '.mdxforge/extensions/local-dashboard/dist/style.css'),
      url: 'mdxforge-extension://local-dashboard/dist/style.css'
    }
  ])
  assert.deepEqual(manifest.packages[0].rules, [
    {
      path: path.join(root, '.mdxforge/extensions/local-dashboard/rules.mdx')
    }
  ])
  assert.equal(manifest.warnings.length, 2)

  const fixtureRoot = path.resolve(
    __dirname,
    '..',
    'test-fixtures',
    'workspaces',
    'local-extension'
  )
  const fixtureManifest = readWorkspaceExtensionManifest(fixtureRoot)

  assert.equal(fixtureManifest.mode, 'safe')
  assert.equal(fixtureManifest.warnings.length, 0)
  assert.equal(fixtureManifest.packages.length, 1)
  assert.equal(fixtureManifest.packages[0].name, 'local-components')
  assert.equal(
    fixtureManifest.packages[0].entryUrl,
    'mdxforge-extension://local-components/bundle/extension.js'
  )

  console.log('PASS extensions')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
