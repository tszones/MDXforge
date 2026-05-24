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
  IconRoute,
  IconShieldCheck,
  IconSparkles
} from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
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

function getWorkflow() {
  return [
    m.home_workflow_generate(),
    m.home_workflow_open(),
    m.home_workflow_review(),
    m.home_workflow_share()
  ]
}

function HomePage() {
  const features = getFeatures()
  const workflow = getWorkflow()

  return (
    <main className="min-h-screen overflow-hidden bg-background">
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
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-primary">{m.nav_features()}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{m.home_features_title()}</h2>
          <p className="mt-3 text-muted-foreground">{m.home_features_description()}</p>
        </div>
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

      <section id="workflow" className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">{m.nav_workflow()}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {m.home_workflow_title()}
            </h2>
            <p className="mt-4 text-muted-foreground">{m.home_workflow_description()}</p>
          </div>
          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="safety"
        className="mx-auto grid max-w-6xl gap-4 px-6 py-16 sm:py-24 md:grid-cols-2"
      >
        <Card className="bg-card/70">
          <CardHeader>
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShieldCheck className="size-5" />
            </div>
            <CardTitle>{m.home_safety_title()}</CardTitle>
            <CardDescription>{m.home_safety_description()}</CardDescription>
          </CardHeader>
        </Card>
        <Card id="download" className="bg-card/70">
          <CardHeader>
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconSparkles className="size-5" />
            </div>
            <CardTitle>{m.home_download_title()}</CardTitle>
            <CardDescription>{m.home_download_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/tszones/MDXforge/releases"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            >
              <IconRoute className="size-4" />
              {m.home_download_cta()}
            </a>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
