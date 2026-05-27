import type { TOCItemType } from 'fumadocs-core/toc'
import { useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import type { getMDXComponents } from '../mdx'

type MdxModule = {
  default: React.ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>
  toc?: TOCItemType[]
}

export function useCompiledMdxModule({
  compiledSource,
  compileError,
  isMarkdownDocument
}: {
  compiledSource: string
  compileError?: string | null
  isMarkdownDocument: boolean
}): {
  module: MdxModule | null
  compileError: string | null
  renderError: string | null
  setRenderError: (message: string | null) => void
} {
  const [module, setModule] = useState<MdxModule | null>(null)
  const [currentCompileError, setCurrentCompileError] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false

    async function compileMdx(): Promise<void> {
      setModule(null)
      setCurrentCompileError(compileError ?? null)
      setRenderError(null)

      if (compileError || !isMarkdownDocument) return

      try {
        const fn = new Function(compiledSource)
        const nextModule = fn(runtime) as MdxModule

        if (!canceled) setModule(nextModule)
      } catch (cause) {
        if (!canceled) setCurrentCompileError(cause instanceof Error ? cause.message : String(cause))
      }
    }

    void compileMdx()

    return () => {
      canceled = true
    }
  }, [compiledSource, compileError, isMarkdownDocument])

  return {
    module,
    compileError: currentCompileError,
    renderError,
    setRenderError
  }
}
