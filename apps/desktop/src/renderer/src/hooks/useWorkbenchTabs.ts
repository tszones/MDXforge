import { useEffect, useMemo, useState } from 'react'
import type { WorkbenchDocumentTab } from '../components/workbench/DocumentTabs'
import type { MdxWorkspace } from '../types'

interface OpenTabOptions {
  newTab?: boolean
}

export function useWorkbenchTabs({
  workspace,
  setWorkspace,
  openPath
}: {
  workspace: MdxWorkspace
  setWorkspace: (workspace: MdxWorkspace | null) => void
  openPath: (
    filePath: string,
    workspaceRoot?: string,
    refreshFolder?: boolean
  ) => Promise<MdxWorkspace | null>
}): {
  tabs: WorkbenchDocumentTab[]
  activeTabId: string | null
  activeTab: WorkbenchDocumentTab | null
  openOrActivate: (
    filePath: string,
    workspaceRoot?: string,
    options?: OpenTabOptions
  ) => Promise<void>
  activate: (tabId: string) => void
  close: (tabId: string) => void
} {
  const [tabs, setTabs] = useState<WorkbenchDocumentTab[]>(() => [toTab(workspace)])
  const [activeTabId, setActiveTabId] = useState(workspace.file.path)

  useEffect(() => {
    setTabs((current) => {
      if (current.some((tab) => tab.id === workspace.file.path)) return current
      return [...current, toTab(workspace)]
    })
    setActiveTabId(workspace.file.path)
  }, [workspace])

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null,
    [activeTabId, tabs]
  )

  async function openOrActivate(
    filePath: string,
    workspaceRoot?: string,
    options: OpenTabOptions = {}
  ): Promise<void> {
    const existing = tabs.find((tab) => tab.file.path === filePath)
    if (options.newTab && existing) {
      activate(existing.id)
      return
    }

    const nextWorkspace = await openPath(filePath, workspaceRoot, false)
    if (!nextWorkspace) return

    const tab = toTab(nextWorkspace)
    if (options.newTab) {
      setTabs((current) => (current.some((item) => item.id === tab.id) ? current : [...current, tab]))
    } else {
      setTabs((current) => replaceActiveTab(current, activeTabId, tab))
    }
    setActiveTabId(tab.id)
    setWorkspace(nextWorkspace)
  }

  function activate(tabId: string): void {
    const tab = tabs.find((item) => item.id === tabId)
    if (!tab) return
    setActiveTabId(tabId)
    setWorkspace({ ...workspace, file: tab.file })
  }

  function close(tabId: string): void {
    setTabs((current) => {
      const index = current.findIndex((tab) => tab.id === tabId)
      if (index === -1) return current

      const nextTabs = current.filter((tab) => tab.id !== tabId)
      if (activeTabId !== tabId) return nextTabs

      const nextActive = nextTabs[index] ?? nextTabs[index - 1] ?? null
      setActiveTabId(nextActive?.id ?? null)
      if (nextActive) {
        setWorkspace({ ...workspace, file: nextActive.file })
      }
      return nextTabs
    })
  }

  return { tabs, activeTabId, activeTab, openOrActivate, activate, close }
}

function toTab(workspace: MdxWorkspace): WorkbenchDocumentTab {
  return {
    id: workspace.file.path,
    file: workspace.file
  }
}

function replaceActiveTab(
  tabs: WorkbenchDocumentTab[],
  activeTabId: string | null,
  nextTab: WorkbenchDocumentTab
): WorkbenchDocumentTab[] {
  const withoutDuplicate = tabs.filter((tab) => tab.id !== nextTab.id)
  const activeIndex = withoutDuplicate.findIndex((tab) => tab.id === activeTabId)
  if (activeIndex === -1) return [...withoutDuplicate, nextTab]
  return withoutDuplicate.map((tab, index) => (index === activeIndex ? nextTab : tab))
}
