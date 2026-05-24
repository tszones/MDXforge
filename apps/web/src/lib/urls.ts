export function isLinkActive(href: string | undefined, pathname: string): boolean {
  if (!href || href.includes('#') || href.startsWith('http')) return false
  const normalizedHref = href === '/' ? '/' : href.replace(/\/$/, '') || '/'
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '') || '/'
  return normalizedPath === normalizedHref
}

export function getMailtoUrl(email: string | undefined | null): string | undefined {
  if (!email?.trim()) return undefined
  const trimmed = email.trim()
  return trimmed.includes('<')
    ? trimmed.replace(/^[^<]*<([^>]*)>.*$/, 'mailto:$1')
    : `mailto:${trimmed}`
}
