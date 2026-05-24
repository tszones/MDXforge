import { Text } from '@react-email/components'
import EmailLayout from '@/mail/components/email-layout'
import { m } from '@/paraglide/messages'

interface ContactMessageProps {
  name: string
  email: string
  message: string
}

export default function ContactMessage({ name, email, message }: ContactMessageProps) {
  return (
    <EmailLayout>
      <Text className="text-lg font-semibold">{m.mail_contact_subject()}</Text>
      <Text>
        {m.mail_contact_name()} {name}
      </Text>
      <Text>
        {m.mail_contact_email()} {email}
      </Text>
      <Text>
        {m.mail_contact_message()} {message}
      </Text>
    </EmailLayout>
  )
}
