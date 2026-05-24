import type { MDXComponents } from 'mdx/types'
import type * as runtime from 'react/jsx-runtime'
import type { MdxWorkspace } from '../../types'

export type ExtensionRuntime = typeof runtime
export type ExtensionDefinition = {
  components?: MDXComponents
}
export type ExtensionModule = {
  default?: ExtensionDefinition | ((runtime: ExtensionRuntime) => ExtensionDefinition)
  components?: MDXComponents
}
export type ExtensionLoadPackage = {
  entryUrl: string
  styles: Array<{ url: string }>
}

export function loadExtensionStyle(url: string): void {
  const id = `mdxforge-extension-style:${url}`
  if (document.getElementById(id)) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

export function serializeExtensionLoadPackages(
  packages: NonNullable<MdxWorkspace['extensions']>['packages']
): string {
  return JSON.stringify(
    packages.map((extensionPackage) => ({
      entryUrl: extensionPackage.entryUrl,
      styles: extensionPackage.styles.map((style) => ({ url: style.url }))
    }))
  )
}

export function parseExtensionLoadPackages(snapshot: string): ExtensionLoadPackage[] {
  return JSON.parse(snapshot) as ExtensionLoadPackage[]
}
