import { Container, Font, Head, Hr, Html, Section, Tailwind, Text } from '@react-email/components'
import { m } from '@/paraglide/messages'

interface EmailLayoutProps {
  children: React.ReactNode
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  const year = new Date().getFullYear()

  return (
    <Html lang="en">
      <Head>
        <Font fontFamily="Inter" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
      </Head>
      <Tailwind>
        <Section className="bg-slate-50 p-4">
          <Container className="rounded-xl bg-white p-6 text-slate-950">
            {children}
            <Hr className="my-8" />
            <Text className="text-sm text-slate-500">
              © {year} {m.site_name()}
            </Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  )
}
