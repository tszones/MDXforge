import { Routes } from '@/lib/routes'
import { m } from '@/paraglide/messages'
import type { MenuItemConfig } from '@/types'

export function getNavbarLinks(): MenuItemConfig[] {
  return [
    { title: m.nav_features(), href: Routes.Features, external: false },
    { title: m.nav_workflow(), href: Routes.Workflow, external: false },
    { title: m.nav_safety(), href: Routes.Safety, external: false },
    { title: m.nav_docs(), href: Routes.Docs, external: false },
    { title: m.nav_download(), href: Routes.Download, external: false }
  ]
}
