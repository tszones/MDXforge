import { m } from '@/paraglide/messages'

export const websiteConfig = {
  ui: {
    mode: {
      defaultMode: 'dark' as const,
      enableSwitch: true
    }
  },
  metadata: {
    get name() {
      return m.site_name()
    },
    get title() {
      return m.site_title()
    },
    get description() {
      return m.site_description()
    },
    images: {
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png'
    }
  },
  social: {
    github: 'https://github.com/tszones/MDXforge'
  },
  mail: {
    supportEmail: 'MDXForge <support@mdxforge.dev>'
  }
}
