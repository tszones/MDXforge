import { websiteConfig } from '@/config/website'
import { serverEnv } from '@/env/server'
import type {
  MailProvider,
  SendEmailResult,
  SendRawEmailParams,
  SendTemplateParams
} from '@/mail/types'
import { getTemplate } from '../render'

export class CloudflareProvider implements MailProvider {
  private from: string
  private accountId: string
  private apiToken: string
  private endpoint = 'https://api.cloudflare.com/client/v4/accounts'

  constructor() {
    const from = websiteConfig.mail.fromEmail
    if (!from) throw new Error('mail.fromEmail is required.')
    if (!serverEnv.CLOUDFLARE_ACCOUNT_ID) throw new Error('CLOUDFLARE_ACCOUNT_ID is required.')
    if (!serverEnv.CLOUDFLARE_API_TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is required.')
    this.from = from
    this.accountId = serverEnv.CLOUDFLARE_ACCOUNT_ID
    this.apiToken = serverEnv.CLOUDFLARE_API_TOKEN
  }

  getProviderName(): string {
    return 'cloudflare'
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendEmailResult> {
    try {
      const mailTemplate = await getTemplate(params)
      return this.sendRawEmail({
        to: params.to,
        subject: mailTemplate.subject,
        html: mailTemplate.html,
        text: mailTemplate.text
      })
    } catch (error) {
      console.error('Error sending template email:', error)
      return { success: false, error }
    }
  }

  async sendRawEmail(params: SendRawEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, text } = params
    if (!this.from || !to || !subject || !html) return { success: false, error: 'Missing fields' }

    try {
      const response = await fetch(`${this.endpoint}/${this.accountId}/email/sending/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, from: this.from, subject, html, text })
      })
      const data = (await response.json()) as {
        success: boolean
        result?: { delivered: string[] }
        errors?: { code: number; message: string }[]
      }

      if (!data.success) {
        const error =
          data.errors?.map((e) => `${e.code}: ${e.message}`).join(', ') || 'Unknown error'
        console.error('Error sending email via Cloudflare:', error)
        return { success: false, error }
      }

      return { success: true, messageId: data.result?.delivered?.[0] }
    } catch (error) {
      console.error('Error sending email via Cloudflare:', error)
      return { success: false, error }
    }
  }
}
