const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename)
const {
  getLocalImageIdFromUrl,
  getRegisteredLocalImagePath,
  LOCAL_IMAGE_SCHEME,
  resolveLocalImageSource
} = jiti('../src/main/local-images.ts')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdxforge-local-images-'))

function write(relativePath, content = '') {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
  return filePath
}

try {
  const documentPath = write('docs/guide.mdx', '# Guide')
  const relativeImagePath = write('docs/images/hero image.png')
  const rootImagePath = write('assets/logo.svg')
  const encodedImagePath = write('docs/images/hash#name.svg')
  const outsideImagePath = path.join(path.dirname(root), 'outside.png')
  fs.writeFileSync(outsideImagePath, '')

  const relativeImageUrl = resolveLocalImageSource('./images/hero image.png', {
    documentPath,
    workspaceRoot: root
  })

  assert.equal(new URL(relativeImageUrl).protocol, `${LOCAL_IMAGE_SCHEME}:`)
  assert.equal(
    getRegisteredLocalImagePath(getLocalImageIdFromUrl(relativeImageUrl)),
    relativeImagePath
  )

  const rootImageUrl = resolveLocalImageSource('/assets/logo.svg#mark', {
    documentPath,
    workspaceRoot: root
  })

  assert.equal(rootImageUrl.endsWith('#mark'), true)
  assert.equal(getRegisteredLocalImagePath(getLocalImageIdFromUrl(rootImageUrl)), rootImagePath)

  const fileImageUrl = resolveLocalImageSource(pathToFileURL(encodedImagePath).href, {
    documentPath,
    workspaceRoot: root
  })

  assert.equal(getRegisteredLocalImagePath(getLocalImageIdFromUrl(fileImageUrl)), encodedImagePath)

  assert.equal(
    resolveLocalImageSource(pathToFileURL(outsideImagePath).href, {
      documentPath,
      workspaceRoot: root
    }),
    null
  )
  assert.equal(
    resolveLocalImageSource('../outside.png', {
      documentPath,
      workspaceRoot: root
    }),
    null
  )
  assert.equal(
    resolveLocalImageSource('https://example.com/hero.png', {
      documentPath,
      workspaceRoot: root
    }),
    null
  )
  assert.equal(
    resolveLocalImageSource('data:image/png;base64,abc', {
      documentPath,
      workspaceRoot: root
    }),
    null
  )
  assert.equal(
    resolveLocalImageSource('./guide.mdx', {
      documentPath,
      workspaceRoot: root
    }),
    null
  )

  console.log('PASS local-images')
} finally {
  fs.rmSync(path.join(path.dirname(root), 'outside.png'), { force: true })
  fs.rmSync(root, { recursive: true, force: true })
}
