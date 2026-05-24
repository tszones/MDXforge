import { buttonVariants } from '@mdxforge/ui/components/button'
import { cn } from '@mdxforge/ui/lib/utils'
import { IconBrandGithub } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import Container from '@/components/layout/container'
import { NavbarMobile } from '@/components/layout/navbar-mobile'
import { Logo } from '@/components/shared/logo'
import { ModeSwitcher } from '@/components/theme/mode-switcher'
import { getNavbarLinks } from '@/config/navbar-config'
import { websiteConfig } from '@/config/website'
import { useScroll } from '@/hooks/use-scroll'
import { Routes } from '@/lib/routes'
import { isLinkActive } from '@/lib/urls'
import { m } from '@/paraglide/messages'

export function Navbar({ scroll = true }: { scroll?: boolean }) {
  const pathname = useLocation().pathname
  const scrolled = useScroll(50)
  const menuLinks = getNavbarLinks()
  const [, setMenuValue] = useState<string | null>(null)
  const showBarBg = scroll && scrolled

  useEffect(() => setMenuValue(null), [])

  return (
    <header
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        showBarBg && 'border-b'
      )}
    >
      {showBarBg && (
        <div className="absolute inset-0 z-0 bg-muted/50 backdrop-blur-md" aria-hidden="true" />
      )}
      <div className="relative z-10">
        <Container className="px-4">
          <nav
            aria-label={m.nav_main()}
            className="hidden items-center justify-between gap-4 lg:flex"
          >
            <Link to="/" aria-label={m.nav_home()} className="flex shrink-0 items-center gap-2">
              <Logo />
              <span className="text-xl font-semibold">{websiteConfig.metadata.name}</span>
            </Link>

            <div className="flex flex-1 items-center justify-center gap-1">
              {menuLinks.map((item) => (
                <Link
                  key={item.title}
                  to={item.href ?? '#'}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isLinkActive(item.href, pathname) && 'text-primary'
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ModeSwitcher />
              <LanguageSwitcher />
              <a
                href={Routes.GitHub}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
              >
                <IconBrandGithub className="size-4" />
                {m.home_github()}
              </a>
            </div>
          </nav>

          <NavbarMobile className="lg:hidden" />
        </Container>
      </div>
    </header>
  )
}
