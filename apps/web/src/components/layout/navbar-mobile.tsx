import { Button } from '@mdxforge/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@mdxforge/ui/components/collapsible'
import { cn } from '@mdxforge/ui/lib/utils'
import { IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import { Logo } from '@/components/shared/logo'
import { ModeSwitcherHorizontal } from '@/components/theme/mode-switcher-horizontal'
import { getNavbarLinks } from '@/config/navbar-config'
import { websiteConfig } from '@/config/website'
import { isLinkActive } from '@/lib/urls'
import { m } from '@/paraglide/messages'

const mobileLinkClass =
  'flex w-full items-center rounded-md p-2 text-base text-muted-foreground transition-colors duration-150 hover:text-foreground'
const mobileLinkActiveClass = 'font-semibold text-primary'

export function NavbarMobile({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = useLocation().pathname
  const [open, setOpen] = useState(false)
  const menuLinks = getNavbarLinks()

  useEffect(() => setOpen(false), [])

  return (
    <>
      <div className={cn('flex items-center justify-between', className)} {...props}>
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold">{websiteConfig.metadata.name}</span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-label={m.nav_toggle_menu()}
          onClick={() => setOpen((value) => !value)}
          className="size-8 rounded-md border"
        >
          {open ? <IconX className="size-4" /> : <IconMenu2 className="size-4" />}
        </Button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={m.nav_mobile_menu()}
          className="fixed inset-0 top-16 z-50 flex flex-col overflow-y-auto bg-background animate-in fade-in-0 duration-200"
        >
          <div className="flex flex-1 flex-col items-start gap-4 p-4">
            <ul className="w-full space-y-1">
              {menuLinks.map((item) => {
                const active = item.href
                  ? isLinkActive(item.href, pathname)
                  : item.items?.some((sub) => isLinkActive(sub.href, pathname))

                return (
                  <li key={item.title} className="py-1">
                    {item.items ? (
                      <Collapsible>
                        <CollapsibleTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              className={cn(
                                'w-full justify-between bg-transparent text-left text-base text-muted-foreground hover:text-foreground',
                                active && 'font-semibold text-primary'
                              )}
                            >
                              {item.title}
                              <IconChevronRight className="size-4" />
                            </Button>
                          }
                          nativeButton={false}
                        />
                        <CollapsibleContent className="pl-2">
                          <ul className="mt-2 space-y-2">
                            {item.items.map((sub) => (
                              <li key={sub.title}>
                                <Link
                                  to={sub.href ?? '#'}
                                  target={sub.external ? '_blank' : undefined}
                                  rel={sub.external ? 'noopener noreferrer' : undefined}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    mobileLinkClass,
                                    isLinkActive(sub.href, pathname) && mobileLinkActiveClass
                                  )}
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        to={item.href ?? '#'}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(mobileLinkClass, active && mobileLinkActiveClass)}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="mt-auto flex w-full flex-wrap items-center justify-end gap-3 border-t border-border/50 p-4">
              <LanguageSwitcher />
              <ModeSwitcherHorizontal />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
