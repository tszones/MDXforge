import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'

const DOWNLOAD_PREFIX = 'downloads/'

const SAFE_INLINE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-icon',
  'application/pdf'
])

export const Route = createFileRoute('/downloads/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = normalizeDownloadKey(params._splat)
        if (!key) return new Response('Bad Request', { status: 400 })

        const bucket = env.PUBLIC_DOWNLOADS
        if (!bucket) return new Response('Downloads not configured', { status: 503 })

        const file = await bucket.get(key)
        if (!file) return new Response('Not Found', { status: 404 })

        const headers = new Headers()
        file.writeHttpMetadata(headers)
        headers.set('etag', file.httpEtag)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')

        const contentType = headers.get('Content-Type') ?? 'application/octet-stream'
        headers.set('Content-Type', contentType)
        if (!SAFE_INLINE_TYPES.has(contentType.toLowerCase())) {
          headers.set('Content-Disposition', `attachment; filename="${getFilename(key)}"`)
        }

        return new Response(file.body, { headers })
      }
    }
  }
})

function normalizeDownloadKey(value: string | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null

  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return null
  }

  const normalized = decoded.replace(/^\/+/, '')
  if (!normalized || normalized.includes('..') || normalized.includes('\\')) return null

  return normalized.startsWith(DOWNLOAD_PREFIX) ? normalized : `${DOWNLOAD_PREFIX}${normalized}`
}

function getFilename(key: string): string {
  return (key.split('/').pop() || 'download').replace(/[^a-zA-Z0-9._-]/g, '_')
}
