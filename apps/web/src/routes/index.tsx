import { buttonVariants } from '@mdxforge/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@mdxforge/ui/components/card'
import { cn } from '@mdxforge/ui/lib/utils'
import {
  IconBook2,
  IconBrandGithub,
  IconDeviceDesktop,
  IconFileTypeTsx,
  IconShieldCheck
} from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: m.home_meta_title() },
      {
        name: 'description',
        content: m.home_meta_description()
      }
    ]
  }),
  component: HomePage
})

function getFeatures() {
  return [
    {
      title: m.home_feature_local_title(),
      description: m.home_feature_local_description(),
      icon: IconFileTypeTsx
    },
    {
      title: m.home_feature_docs_title(),
      description: m.home_feature_docs_description(),
      icon: IconBook2
    },
    {
      title: m.home_feature_safe_title(),
      description: m.home_feature_safe_description(),
      icon: IconShieldCheck
    }
  ] as const
}

function HomePage() {
  const features = getFeatures()

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>

      <section className="relative border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.74_0.14_181/.18),transparent_34rem)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
            <IconDeviceDesktop className="size-4 text-primary" />
            {m.home_badge()}
          </div>

          <h1 className="mt-8 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            {m.home_title()}
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            {m.home_description()}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://github.com/tszones/MDXforge"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
            >
              <IconBrandGithub className="size-4" />
              {m.home_github()}
            </a>
            <a href="#features" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              {m.home_features_link()}
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-card/70">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-1.5 rounded-full bg-linear-to-r from-primary/60 to-transparent" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </main>
  )
}
