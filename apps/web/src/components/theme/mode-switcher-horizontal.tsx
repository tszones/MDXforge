import { Button } from '@mdxforge/ui/components/button'
import { cn } from '@mdxforge/ui/lib/utils'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme/theme-provider'
import { m } from '@/paraglide/messages'

export function ModeSwitcherHorizontal() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border p-1">
        <div className="size-6 rounded-full bg-muted" />
        <div className="size-6 rounded-full bg-muted" />
        <div className="size-6 rounded-full bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border p-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-6 rounded-full p-0', theme === 'light' && 'bg-muted text-foreground')}
        onClick={() => setTheme('light')}
        aria-label={m.theme_light()}
      >
        <IconSun className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-6 rounded-full p-0', theme === 'dark' && 'bg-muted text-foreground')}
        onClick={() => setTheme('dark')}
        aria-label={m.theme_dark()}
      >
        <IconMoon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-6 rounded-full p-0', theme === 'system' && 'bg-muted text-foreground')}
        onClick={() => setTheme('system')}
        aria-label={m.theme_system()}
      >
        <IconDeviceDesktop className="size-4" />
      </Button>
    </div>
  )
}
