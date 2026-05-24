import { cn } from '@mdxforge/ui/lib/utils'
import { IconBrandGithub } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import Container from '@/components/layout/container'
import { Logo } from '@/components/shared/logo'
import { getFooterLinks } from '@/config/footer-config'
import { websiteConfig } from '@/config/website'
import { isLinkActive } from '@/lib/urls'
import { m } from '@/paraglide/messages'

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = useLocation().pathname
  const footerLinks = getFooterLinks()

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-5">
          <div className="col-span-full flex flex-col items-start md:col-span-2">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold">{websiteConfig.metadata.name}</span>
            </div>
            <p className="py-2 text-base text-muted-foreground md:pr-12">{m.footer_tagline()}</p>
            <nav aria-label={m.footer_social()} className="flex items-center gap-4 pt-6">
              <a
                href={websiteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex size-8 items-center justify-center rounded-full border border-border transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <IconBrandGithub className="size-4" />
              </a>
            </nav>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1 flex flex-col items-start">
              <span className="text-sm font-semibold uppercase">{section.title}</span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            data-active={
                              item.href.includes('#')
                                ? undefined
                                : isLinkActive(item.href, pathname)
                                  ? 'true'
                                  : undefined
                            }
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
                          >
                            {item.title}
                          </Link>
                        )}
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t py-8">
        <Container className="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {websiteConfig.metadata.name}. {m.footer_rights()}
          </span>
        </Container>
      </div>
    </footer>
  )
}
