import React, { type ReactElement } from 'react'
import { m } from '@/paraglide/messages'
import ContactMessage from './templates/contact-message'
import type { EmailTemplate } from './types'

const EmailTemplates = {
  contactMessage: ContactMessage
} as const

export async function renderEmailHtml(email: ReactElement): Promise<string> {
  const reactDomServer = (await import('react-dom/server')) as {
    renderToReadableStream?: (element: ReactElement) => Promise<ReadableStream>
    renderToStaticMarkup?: (element: ReactElement) => string
    renderToString?: (element: ReactElement) => string
  }

  if (reactDomServer.renderToReadableStream) {
    const stream = await reactDomServer.renderToReadableStream(email)
    return await new Response(stream).text()
  }
  if (reactDomServer.renderToStaticMarkup) return reactDomServer.renderToStaticMarkup(email)
  if (reactDomServer.renderToString) return reactDomServer.renderToString(email)

  throw new Error('No suitable React DOM server renderer available')
}

const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'"
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&[a-zA-Z]+;/g, (entity) => NAMED_ENTITIES[entity] ?? entity)
}

export function toPlainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export async function getTemplate({
  template,
  context
}: {
  template: EmailTemplate
  context: Record<string, unknown>
}) {
  const Component = EmailTemplates[template]
  const email = React.createElement(
    Component as unknown as React.ComponentType<Record<string, unknown>>,
    context
  )
  const html = await renderEmailHtml(email)
  const text = toPlainText(html)
  const subject = m.mail_contact_subject()
  return { html, text, subject }
}
