import { websiteConfig } from '@/config/website'
import { CloudflareProvider } from './provider/cloudflare'
import { ResendProvider } from './provider/resend'
import type {
  MailProvider,
  MailProviderName,
  SendEmailResult,
  SendRawEmailParams,
  SendTemplateParams
} from './types'

let mailProvider: MailProvider | null = null

type ProviderFactory = () => MailProvider

const providerRegistry: Record<MailProviderName, ProviderFactory> = {
  resend: () => new ResendProvider(),
  cloudflare: () => new CloudflareProvider()
}

function createProvider(): MailProvider {
  const name = websiteConfig.mail.provider
  const factory = providerRegistry[name]
  if (!factory) throw new Error(`Unsupported mail provider: ${name}.`)
  return factory()
}

export function getMailProvider(): MailProvider {
  if (!mailProvider) mailProvider = createProvider()
  return mailProvider
}

export async function sendEmail(
  params: SendTemplateParams | SendRawEmailParams
): Promise<SendEmailResult> {
  if (!websiteConfig.mail.enable) return { success: false, error: 'Mail feature is disabled' }

  try {
    const provider = getMailProvider()
    const result =
      'template' in params
        ? await provider.sendTemplate(params)
        : await provider.sendRawEmail(params)
    if (!result.success) console.error('[mail] Send failed:', result.error)
    return result
  } catch (error) {
    console.error('[mail] Unexpected error:', error)
    return { success: false, error }
  }
}
