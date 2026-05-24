export const SITE_URL = 'https://mdxforge.dev'
export const SITE_NAME = 'MDXForge'
export const DEFAULT_OG_IMAGE = '/og.png'
export const SEO_DEFAULT_KEYWORDS = [
  'MDXForge',
  'MDX preview',
  'Markdown preview',
  'AI documentation',
  'local-first docs',
  'MDX desktop app'
] as const

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
