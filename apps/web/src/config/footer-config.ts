import { Routes } from '@/lib/routes'
import { m } from '@/paraglide/messages'
import type { MenuItemConfig } from '@/types'

export function getFooterLinks(): MenuItemConfig[] {
  return [
    {
      title: m.footer_product(),
      items: [
        { title: m.nav_features(), href: Routes.Features, external: false },
        { title: m.nav_workflow(), href: Routes.Workflow, external: false },
        { title: m.nav_safety(), href: Routes.Safety, external: false }
      ]
    },
    {
      title: m.footer_resources(),
      items: [
        { title: m.nav_download(), href: Routes.Download, external: false },
        { title: m.footer_github(), href: Routes.GitHub, external: true }
      ]
    },
    {
      title: m.footer_company(),
      items: [{ title: m.nav_contact(), href: Routes.Contact, external: false }]
    }
  ]
}
