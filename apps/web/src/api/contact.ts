import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { websiteConfig } from '@/config/website'
import { sendEmail } from '@/mail'
import { m } from '@/paraglide/messages'

const schema = z.object({
  name: z.string().trim().min(3).max(60),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(1000)
})

export const sendContactMessage = createServerFn({ method: 'POST' })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    const result = await sendEmail({
      to: websiteConfig.mail.supportEmail,
      template: 'contactMessage',
      context: {
        name: data.name,
        email: data.email,
        message: data.message
      }
    })

    if (!result.success) throw new Error(m.contact_error())
  })
