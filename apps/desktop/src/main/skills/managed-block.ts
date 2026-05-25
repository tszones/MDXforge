const startMarker = '<!-- mdxforge:managed:start -->'
const endMarker = '<!-- mdxforge:managed:end -->'

export interface ManagedBlockResult {
  content: string
  conflict: boolean
  reason?: string
}

export function upsertManagedBlock(content: string, managedContent: string): ManagedBlockResult {
  const start = content.indexOf(startMarker)
  const end = content.indexOf(endMarker)
  const block = `${startMarker}\n${managedContent.trim()}\n${endMarker}`

  if ((start === -1 && end !== -1) || (start !== -1 && end === -1) || (start > end && end !== -1)) {
    return { content, conflict: true, reason: 'Managed block markers are damaged.' }
  }

  if (start === -1) {
    const prefix = content.trimEnd()
    return { content: prefix ? `${prefix}\n\n${block}\n` : `${block}\n`, conflict: false }
  }

  return {
    content: `${content.slice(0, start)}${block}${content.slice(end + endMarker.length)}`,
    conflict: false
  }
}

export function removeManagedBlock(content: string): ManagedBlockResult {
  const start = content.indexOf(startMarker)
  const end = content.indexOf(endMarker)
  if (start === -1 && end === -1) return { content, conflict: false }
  if ((start === -1 && end !== -1) || (start !== -1 && end === -1) || start > end) {
    return { content, conflict: true, reason: 'Managed block markers are damaged.' }
  }
  return {
    content: `${`${content.slice(0, start)}${content.slice(end + endMarker.length)}`.trimEnd()}\n`,
    conflict: false
  }
}
