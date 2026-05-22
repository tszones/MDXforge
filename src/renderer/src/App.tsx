import { useEffect, useState } from 'react'
import { MdxPreview } from './components/MdxPreview'
import type { MdxWorkspace } from './types'

function App(): React.JSX.Element {
  const [workspace, setWorkspace] = useState<MdxWorkspace | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void window.api.registerDefaultMdxApp()

    const removeOpenedListener = window.api.onMdxFileOpened((openedWorkspace) => {
      setWorkspace(openedWorkspace)
      setError(null)
    })
    const removeErrorListener = window.api.onMdxFileOpenError((message) => {
      setError(message)
    })

    return () => {
      removeOpenedListener()
      removeErrorListener()
    }
  }, [])

  async function openFile(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.openMdxFile()
      if (result) setWorkspace(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function openFolder(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.openMdxFolder()
      if (result) setWorkspace(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function openPath(filePath: string): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      setWorkspace(await window.api.openMdxPath(filePath))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {workspace ? null : (
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={openFile}
            disabled={loading}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? '打开中…' : '打开 MDX 文件'}
          </button>
          <button
            type="button"
            onClick={openFolder}
            disabled={loading}
            className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            打开文件夹
          </button>
        </header>
      )}

      {error ? (
        <pre className="m-4 overflow-auto rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </pre>
      ) : null}

      {workspace ? (
        <MdxPreview
          workspace={workspace}
          onOpenFile={openFile}
          onOpenFolder={openFolder}
          onOpenPath={openPath}
          opening={loading}
        />
      ) : (
        <section className="flex min-h-[calc(100vh-57px)] items-center justify-center p-8 text-center">
          <div>
            <h1 className="mb-2 text-3xl font-semibold">Docuforge</h1>
            <p className="mb-6 text-muted-foreground">
              AI-native MDX docs workspace. 选择一个 .mdx/.md 文件或文件夹并渲染。
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={openFile}
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
              >
                选择文件
              </button>
              <button
                type="button"
                onClick={openFolder}
                disabled={loading}
                className="rounded-md border px-4 py-2 font-medium disabled:opacity-60"
              >
                选择文件夹
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
