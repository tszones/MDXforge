import type { MDXComponents } from 'mdx/types'
import { useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import type { MdxWorkspace } from '../../types'
import {
  type ExtensionModule,
  loadExtensionStyle,
  parseExtensionLoadPackages,
  serializeExtensionLoadPackages
} from './extensions'

export function useWorkspaceExtensions({
  workspace,
  fallbackPath
}: {
  workspace: MdxWorkspace
  fallbackPath: string
}): {
  extensionComponents: MDXComponents
  extensionComponentsKey: string
  extensionError: string | null
  extensionPackages: NonNullable<MdxWorkspace['extensions']>['packages']
  extensionWarnings: NonNullable<MdxWorkspace['extensions']>['warnings']
  extensionsEnabled: boolean
  hasExtensionPackages: boolean
  enableExtensions: () => void
  disableExtensions: () => void
} {
  const extensionPackages = workspace.extensions?.packages ?? []
  const extensionWarnings = workspace.extensions?.warnings ?? []
  const extensionPackageSnapshot = serializeExtensionLoadPackages(extensionPackages)
  const extensionWorkspaceKey = workspace.extensions?.workspaceRoot ?? fallbackPath
  const extensionTrustKey = `${extensionWorkspaceKey}\n${extensionPackageSnapshot}`
  const [trustedExtensionKey, setTrustedExtensionKey] = useState<string | null>(null)
  const [extensionComponents, setExtensionComponents] = useState<MDXComponents>({})
  const [extensionError, setExtensionError] = useState<string | null>(null)
  const hasExtensionPackages = extensionPackages.length > 0
  const extensionsEnabled = hasExtensionPackages && trustedExtensionKey === extensionTrustKey
  const extensionComponentsKey = Object.keys(extensionComponents).sort().join('|')

  useEffect(() => {
    let canceled = false

    async function loadExtensions(): Promise<void> {
      setExtensionComponents({})
      setExtensionError(null)
      const packages = parseExtensionLoadPackages(extensionPackageSnapshot)

      if (!extensionsEnabled || packages.length === 0) {
        void window.api.setWorkspaceExtensionsEnabled(false)
        return
      }

      try {
        const enabled = await window.api.setWorkspaceExtensionsEnabled(true, extensionTrustKey)
        if (!enabled) throw new Error('Workspace extension trust no longer matches.')

        for (const style of packages.flatMap((item) => item.styles)) {
          loadExtensionStyle(style.url)
        }

        const loadedComponents: MDXComponents = {}
        for (const extensionPackage of packages) {
          const extensionModule = (await import(
            /* @vite-ignore */ extensionPackage.entryUrl
          )) as ExtensionModule
          const extensionDefinition =
            typeof extensionModule.default === 'function'
              ? extensionModule.default(runtime)
              : extensionModule.default
          Object.assign(
            loadedComponents,
            extensionModule.components ?? extensionDefinition?.components ?? {}
          )
        }

        if (!canceled) setExtensionComponents(loadedComponents)
      } catch (cause) {
        if (!canceled) {
          setExtensionComponents({})
          setExtensionError(cause instanceof Error ? cause.message : String(cause))
        }
      }
    }

    void loadExtensions()

    return () => {
      canceled = true
    }
  }, [extensionsEnabled, extensionPackageSnapshot, extensionTrustKey])

  return {
    extensionComponents,
    extensionComponentsKey,
    extensionError,
    extensionPackages,
    extensionWarnings,
    extensionsEnabled,
    hasExtensionPackages,
    enableExtensions: () => setTrustedExtensionKey(extensionTrustKey),
    disableExtensions: () => setTrustedExtensionKey(null)
  }
}
