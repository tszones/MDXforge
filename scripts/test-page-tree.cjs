const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const { readMdxFolder } = jiti('../src/main/page-tree.ts')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdxforge-page-tree-'))

function write(relativePath, content) {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

try {
  write(
    'meta.json',
    JSON.stringify({
      title: 'Docs',
      description: 'Local docs',
      icon: 'BookOpen',
      root: true,
      pages: [
        'index',
        'guide',
        '---[Boxes]Reference---',
        'api',
        'advanced/setup',
        '[Boxes][External](https://example.com)',
        '...tutorials',
        '...',
        '!draft',
        '!localized'
      ]
    })
  )
  write('index.mdx', '---\ntitle: Home\ndescription: Welcome\nicon: Home\n---\n\n# Home\n')
  write('guide.mdx', '---\ntitle: Guide\n---\n\n# Guide\n')
  write('draft.mdx', '---\ntitle: Draft\n---\n\n# Draft\n')
  write('localized.cn.mdx', '---\ntitle: Localized\n---\n\n# Localized\n')
  write('(essentials)/intro.mdx', '---\ntitle: Intro\n---\n\n# Intro\n')
  write('advanced/setup.mdx', '---\ntitle: Setup\n---\n\n# Setup\n')
  write('advanced/skip.mdx', '---\ntitle: Skip\n---\n\n# Skip\n')
  write(
    'tutorials/meta.json',
    JSON.stringify({
      pages: ['one', 'two']
    })
  )
  write('tutorials/one.mdx', '---\ntitle: One\n---\n\n# One\n')
  write('tutorials/two.mdx', '---\ntitle: Two\n---\n\n# Two\n')
  write('tutorials/three.mdx', '---\ntitle: Three\n---\n\n# Three\n')
  write(
    'api/meta.json',
    JSON.stringify({
      title: 'API',
      description: 'API reference',
      icon: 'Box',
      defaultOpen: true,
      pages: ['index', 'reference']
    })
  )
  write('api/index.mdx', '---\ntitle: API Home\n---\n\n# API\n')
  write('api/reference.mdx', '---\ntitle: Reference\n---\n\n# Reference\n')
  write('api/hidden.mdx', '---\ntitle: Hidden\n---\n\n# Hidden\n')

  const folder = readMdxFolder(root)

  assert.equal(folder.name, 'Docs')
  assert.equal(folder.description, 'Local docs')
  assert.equal(folder.icon, 'BookOpen')
  assert.equal(folder.root, true)
  assert.deepEqual(
    folder.files.map((file) => file.displayPath),
    [
      'index',
      'guide',
      'api',
      'api/reference',
      'advanced/setup',
      'tutorials/one',
      'tutorials/two',
      'intro'
    ]
  )
  assert.deepEqual(
    folder.files.map((file) => file.slug.join('/')),
    [
      '',
      'guide',
      'api',
      'api/reference',
      'advanced/setup',
      'tutorials/one',
      'tutorials/two',
      'intro'
    ]
  )
  assert.equal(folder.files[0].description, 'Welcome')
  assert.equal(folder.files[0].icon, 'Home')
  assert.equal(
    folder.files.find((file) => file.relativePath === 'draft.mdx'),
    undefined
  )
  assert.equal(
    folder.files.find((file) => file.relativePath === 'api/hidden.mdx'),
    undefined
  )
  assert.equal(
    folder.files.find((file) => file.relativePath === 'localized.cn.mdx'),
    undefined
  )
  assert.equal(
    folder.files.find((file) => file.relativePath === 'advanced/skip.mdx'),
    undefined
  )
  assert.equal(
    folder.files.find((file) => file.relativePath === 'tutorials/three.mdx'),
    undefined
  )

  assert.deepEqual(folder.tree, [
    { type: 'file', path: path.join(root, 'index.mdx') },
    { type: 'file', path: path.join(root, 'guide.mdx') },
    { type: 'separator', label: 'Reference', icon: 'Boxes' },
    {
      type: 'folder',
      name: 'API',
      path: 'api',
      description: 'API reference',
      icon: 'Box',
      defaultOpen: true,
      children: [
        { type: 'file', path: path.join(root, 'api/index.mdx') },
        { type: 'file', path: path.join(root, 'api/reference.mdx') }
      ]
    },
    { type: 'file', path: path.join(root, 'advanced/setup.mdx') },
    {
      type: 'link',
      label: 'External',
      href: 'https://example.com',
      external: false,
      icon: 'Boxes'
    },
    { type: 'file', path: path.join(root, 'tutorials/one.mdx') },
    { type: 'file', path: path.join(root, 'tutorials/two.mdx') },
    { type: 'file', path: path.join(root, '(essentials)/intro.mdx') }
  ])

  console.log('PASS page-tree')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
