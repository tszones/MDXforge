import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
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
      }
    ],
    links: [
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
  return <Outlet />
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
        {children}
        <Scripts />
      </body>
    </html>
  )
}
