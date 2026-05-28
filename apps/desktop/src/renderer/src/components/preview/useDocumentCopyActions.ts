import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { m } from '../../paraglide/messages'

export type DocumentCopyState = 'idle' | 'copied' | 'error'

export function useDocumentCopyActions(filePath: string): {
  sourceCopyState: DocumentCopyState
  pathCopyState: DocumentCopyState
  copyRawSource: () => Promise<void>
  copyDocumentPath: () => Promise<void>
  resetCopyState: () => void
} {
  const [sourceCopyState, setSourceCopyState] = useState<DocumentCopyState>('idle')
  const [pathCopyState, setPathCopyState] = useState<DocumentCopyState>('idle')

  useEffect(() => {
    setSourceCopyState('idle')
    setPathCopyState('idle')
  }, [filePath])

  useEffect(() => {
    if (sourceCopyState === 'idle' && pathCopyState === 'idle') return

    const timer = window.setTimeout(() => {
      setSourceCopyState('idle')
      setPathCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [sourceCopyState, pathCopyState])

  function resetCopyState(): void {
    setSourceCopyState('idle')
    setPathCopyState('idle')
  }

  async function copyRawSource(): Promise<void> {
    try {
      await window.api.copyMdxRawSource(filePath)
      setSourceCopyState('copied')
      toast.success(m.actions_copied_raw_source())
    } catch {
      setSourceCopyState('error')
      toast.error(m.actions_copy_raw_source_failed())
    }
  }

  async function copyDocumentPath(): Promise<void> {
    try {
      await window.api.copyPath(filePath)
      setPathCopyState('copied')
      toast.success(m.preview_file_path_copied())
    } catch {
      setPathCopyState('error')
      toast.error(m.preview_file_path_copy_failed())
    }
  }

  return { sourceCopyState, pathCopyState, copyRawSource, copyDocumentPath, resetCopyState }
}
