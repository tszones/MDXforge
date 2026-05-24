import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { RootProvider as FumadocsProvider } from 'fumadocs-ui/provider/tanstack'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { absoluteUrl, SEO_DEFAULT_KEYWORDS, SITE_URL } from '@/config/seo'
import { getCurrentLocale } from '@/lib/i18n'
import { m } from '@/paraglide/messages'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: m.site_title()
      },
      {
        name: 'description',
        content: m.site_description()
      },
      {
        name: 'keywords',
        content: SEO_DEFAULT_KEYWORDS.join(', ')
      },
      {
        name: 'robots',
        content: 'index, follow'
      },
      {
        name: 'theme-color',
        content: '#8a05ff'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:site_name',
        content: m.site_name()
      },
      {
        property: 'og:title',
        content: m.site_title()
      },
      {
        property: 'og:description',
        content: m.site_description()
      },
      {
        property: 'og:url',
        content: SITE_URL
      },
      {
        property: 'og:image',
        content: absoluteUrl('/logo.png')
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: m.site_title()
      },
      {
        name: 'twitter:description',
        content: m.site_description()
      },
      {
        name: 'twitter:image',
        content: absoluteUrl('/logo.png')
      }
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico'
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo.png'
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest'
      },
      {
        rel: 'canonical',
        href: SITE_URL
      },
      {
        rel: 'alternate',
        hrefLang: 'en',
        href: `${SITE_URL}/en`
      },
      {
        rel: 'alternate',
        hrefLang: 'zh',
        href: `${SITE_URL}/zh`
      },
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: SITE_URL
      },
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFound
})

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar scroll />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-primary">{m.not_found_label()}</p>
      <h1 className="mt-3 text-3xl font-semibold">{m.not_found_title()}</h1>
      <p className="mt-4 text-muted-foreground">{m.not_found_description()}</p>
    </main>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={getCurrentLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <FumadocsProvider>{children}</FumadocsProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
