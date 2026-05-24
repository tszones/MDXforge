import { buttonVariants } from '@mdxforge/ui/components/button'
import { Card, CardContent } from '@mdxforge/ui/components/card'
import { cn } from '@mdxforge/ui/lib/utils'
import { IconBrandGithub, IconMail } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { ContactFormCard } from '@/components/contact/contact-form-card'
import Container from '@/components/layout/container'
import { Logo } from '@/components/shared/logo'
import { SITE_URL } from '@/config/seo'
import { websiteConfig } from '@/config/website'
import { getMailtoUrl } from '@/lib/urls'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: m.contact_meta_title() },
      {
        name: 'description',
        content: m.contact_meta_description()
      },
      {
        property: 'og:title',
        content: m.contact_meta_title()
      },
      {
        property: 'og:description',
        content: m.contact_meta_description()
      },
      {
        property: 'og:url',
        content: `${SITE_URL}/contact`
      }
    ]
  }),
  component: ContactPage
})

function ContactPage() {
  const supportEmail = getMailtoUrl(websiteConfig.mail.supportEmail)

  return (
    <main className="min-h-screen bg-background">
      <Container className="px-6 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
              <Logo className="size-8" />
              <span className="font-semibold">{websiteConfig.metadata.name}</span>
            </div>
            <p className="text-sm font-medium text-primary">{m.nav_contact()}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {m.contact_title()}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{m.contact_description()}</p>
          </div>

          <div className="grid gap-4">
            <ContactFormCard />
            <Card className="bg-card/80">
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row">
                {supportEmail && (
                  <a
                    href={supportEmail}
                    className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
                  >
                    <IconMail className="size-4" />
                    {m.contact_email_cta()}
                  </a>
                )}
                <a
                  href={websiteConfig.social.github}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
                >
                  <IconBrandGithub className="size-4" />
                  {m.contact_github_cta()}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  )
}
