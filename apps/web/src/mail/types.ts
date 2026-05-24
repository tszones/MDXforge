import type { websiteConfig } from '@/config/website'

type MailConfig = typeof websiteConfig.mail

export type MailProviderName = NonNullable<MailConfig['provider']>

export type EmailTemplate = 'contactMessage'

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: unknown
}

export interface SendTemplateParams {
  to: string
  template: EmailTemplate
  context: Record<string, unknown>
}

export interface SendRawEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export interface MailProvider {
  getProviderName(): string
  sendTemplate(params: SendTemplateParams): Promise<SendEmailResult>
  sendRawEmail(params: SendRawEmailParams): Promise<SendEmailResult>
}
