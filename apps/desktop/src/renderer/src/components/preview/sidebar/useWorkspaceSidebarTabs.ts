import { useHotkeys } from '@tanstack/react-hotkeys'
import { useEffect, useState } from 'react'
import { appHotkeys } from '../../../lib/hotkeys'
import type { MdxWorkspaceSearchResult } from '../../../types'

export type SidebarTab = 'files' | 'search'

export function useWorkspaceSidebarTabs({
  hasWorkspaceFolder,
  onExpandSidebar,
  workspaceSearchInputRef
}: {
  hasWorkspaceFolder: boolean
  onExpandSidebar?: () => void
  workspaceSearchInputRef: React.RefObject<HTMLInputElement | null>
}): {
  activeTab: SidebarTab
  setActiveTab: (tab: SidebarTab) => void
} {
  const [activeTab, setActiveTab] = useState<SidebarTab>('files')

  useHotkeys(
    [
      {
        hotkey: appHotkeys.searchWorkspace,
        callback: () => {
          onExpandSidebar?.()
          window.setTimeout(() => {
            setActiveTab('search')
            workspaceSearchInputRef.current?.focus()
            workspaceSearchInputRef.current?.select()
          }, 0)
        },
        options: {
          enabled: hasWorkspaceFolder,
          meta: {
            name: 'Search workspace',
            description: 'Open the workspace search tab in the sidebar.'
          }
        }
      }
    ],
    { ignoreInputs: true }
  )

  return { activeTab, setActiveTab }
}

export function useWorkspaceSearch({
  activeTab,
  searchQuery,
  workspaceRoot
}: {
  activeTab: SidebarTab
  searchQuery: string
  workspaceRoot?: string
}): {
  searching: boolean
  workspaceSearchResults: MdxWorkspaceSearchResult[]
  workspaceSearchLoading: boolean
  collapsedSearchFiles: Set<string>
  toggleSearchResultFile: (path: string) => void
} {
  const [workspaceSearchResults, setWorkspaceSearchResults] = useState<MdxWorkspaceSearchResult[]>(
    []
  )
  const [workspaceSearchLoading, setWorkspaceSearchLoading] = useState(false)
  const [collapsedSearchFiles, setCollapsedSearchFiles] = useState<Set<string>>(new Set())
  const trimmedQuery = searchQuery.trim()
  const searching = trimmedQuery.length > 0

  useEffect(() => {
    setCollapsedSearchFiles(new Set())
  }, [searchQuery])

  useEffect(() => {
    let canceled = false

    if (!workspaceRoot || activeTab !== 'search' || !trimmedQuery) {
      setWorkspaceSearchResults([])
      setWorkspaceSearchLoading(false)
      return
    }

    setWorkspaceSearchLoading(true)
    const timer = window.setTimeout(() => {
      void window.api
        .searchMdxWorkspace(workspaceRoot, trimmedQuery)
        .then((results) => {
          if (canceled) return
          setWorkspaceSearchResults(results)
          setWorkspaceSearchLoading(false)
        })
        .catch(() => {
          if (canceled) return
          setWorkspaceSearchResults([])
          setWorkspaceSearchLoading(false)
        })
    }, 150)

    return () => {
      canceled = true
      window.clearTimeout(timer)
    }
  }, [activeTab, trimmedQuery, workspaceRoot])

  function toggleSearchResultFile(path: string): void {
    setCollapsedSearchFiles((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return {
    searching,
    workspaceSearchResults,
    workspaceSearchLoading,
    collapsedSearchFiles,
    toggleSearchResultFile
  }
}
