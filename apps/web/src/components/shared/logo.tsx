import { cn } from '@mdxforge/ui/lib/utils'
import { websiteConfig } from '@/config/website'

export function Logo({ className }: { className?: string }) {
  const name = websiteConfig.metadata.name
  const logoLight = websiteConfig.metadata.images.logoLight
  const logoDark = websiteConfig.metadata.images.logoDark

  return (
    <>
      <img
        src={logoLight}
        alt={`${name} logo`}
        className={cn('size-8 rounded-md dark:hidden', className)}
        width={32}
        height={32}
      />
      <img
        src={logoDark}
        alt={`${name} logo`}
        className={cn('hidden size-8 rounded-md dark:block', className)}
        width={32}
        height={32}
      />
    </>
  )
}
