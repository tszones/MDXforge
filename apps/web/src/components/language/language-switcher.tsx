import { Button } from '@mdxforge/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@mdxforge/ui/components/dropdown-menu'
import { IconLanguage } from '@tabler/icons-react'
import { useRouterState } from '@tanstack/react-router'
import { type AppLocale, getCurrentLocale, getLocalizedPath, persistLocale } from '@/lib/i18n'
import { m } from '@/paraglide/messages'

const locales = [
  { value: 'en', label: () => m.language_en() },
  { value: 'zh', label: () => m.language_zh() }
] as const

export function LanguageSwitcher() {
  const currentLocale = getCurrentLocale()
  const currentPath = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.searchStr}${state.location.hash}`
  })

  function switchLocale(locale: AppLocale) {
    if (locale === currentLocale || typeof window === 'undefined') return

    persistLocale(locale)
    window.location.assign(getLocalizedPath(currentPath, locale))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={m.language_switcher()}
          >
            <IconLanguage className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup value={currentLocale}>
          {locales.map((locale) => (
            <DropdownMenuRadioItem
              key={locale.value}
              value={locale.value}
              onClick={() => switchLocale(locale.value)}
            >
              {locale.label()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
