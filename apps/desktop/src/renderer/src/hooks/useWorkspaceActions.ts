import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { MdxWorkspace } from '../types'

export function useInitialOpenPath({
  setWorkspace,
  setError
}: {
  setWorkspace: (workspace: MdxWorkspace) => void
  setError: (error: string | null) => void
}): void {
  const navigate = useNavigate()

  useEffect(() => {
    void window.api.registerDefaultMdxApp()

    const removeOpenedListener = window.api.onMdxFileOpened((openedWorkspace) => {
      setWorkspace(openedWorkspace)
      setError(null)
      navigate('/', { replace: true })
    })
    const removeChangedListener = window.api.onMdxFileChanged((changedWorkspace) => {
      setWorkspace(changedWorkspace)
      setError(null)
    })
    const removeErrorListener = window.api.onMdxFileOpenError((message) => {
      setError(message)
    })
    const removeChangeErrorListener = window.api.onMdxFileChangeError((message) => {
      setError(message)
    })

    return () => {
      removeOpenedListener()
      removeChangedListener()
      removeErrorListener()
      removeChangeErrorListener()
    }
  }, [navigate, setError, setWorkspace])
}

export function useWorkspaceActions(): {
  workspace: MdxWorkspace | null
  error: string | null
  loading: boolean
  setWorkspace: (workspace: MdxWorkspace | null) => void
  setError: (error: string | null) => void
  openFile: () => Promise<void>
  openFolder: () => Promise<void>
  openPath: (filePath: string, workspaceRoot?: string) => Promise<MdxWorkspace | null>
  renamePath: (targetPath: string, nextName: string, workspaceRoot?: string) => Promise<void>
  deletePath: (targetPath: string, workspaceRoot?: string) => Promise<void>
} {
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState<MdxWorkspace | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useInitialOpenPath({ setWorkspace, setError })

  async function openWithLoader(
    loadWorkspace: () => Promise<MdxWorkspace | null>
  ): Promise<MdxWorkspace | null> {
    setLoading(true)
    setError(null)

    try {
      const result = await loadWorkspace()
      if (result) {
        setWorkspace(result)
        navigate('/')
      }
      return result
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      return null
    } finally {
      setLoading(false)
    }
  }

  async function openFile(): Promise<void> {
    await openWithLoader(() => window.api.openMdxFile())
  }

  async function openFolder(): Promise<void> {
    await openWithLoader(() => window.api.openMdxFolder())
  }

  async function openPath(filePath: string, workspaceRoot?: string): Promise<MdxWorkspace | null> {
    return openWithLoader(() => window.api.openMdxPath(filePath, workspaceRoot))
  }

  async function renamePath(
    targetPath: string,
    nextName: string,
    workspaceRoot?: string
  ): Promise<void> {
    await openWithLoader(() => window.api.renameMdxPath(targetPath, nextName, workspaceRoot))
  }

  async function deletePath(targetPath: string, workspaceRoot?: string): Promise<void> {
    await openWithLoader(() => window.api.deleteMdxPath(targetPath, workspaceRoot))
  }

  return {
    workspace,
    error,
    loading,
    setWorkspace,
    setError,
    openFile,
    openFolder,
    openPath,
    renamePath,
    deletePath
  }
}
