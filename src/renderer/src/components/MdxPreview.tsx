import { compile } from '@mdx-js/mdx'
import { rehypeCode } from 'fumadocs-core/mdx-plugins/rehype-code'
import { useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import type { MdxFile } from '../types'
import { getMDXComponents } from './mdx'

interface MdxPreviewProps {
  file: MdxFile
}

type MdxModule = {
  default: React.ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>
}

const mdxComponents = getMDXComponents()

export function MdxPreview({ file }: MdxPreviewProps): React.JSX.Element {
  const [module, setModule] = useState<MdxModule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const title = typeof file.frontmatter.title === 'string' ? file.frontmatter.title : file.name
  const description =
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : file.path

  useEffect(() => {
    let canceled = false

    async function compileMdx(): Promise<void> {
      setModule(null)
      setError(null)

      try {
        const compiled = await compile(file.content, {
          outputFormat: 'function-body',
          development: false,
          rehypePlugins: [rehypeCode]
        })
        const fn = new Function(String(compiled))
        const nextModule = fn(runtime) as MdxModule

        if (!canceled) setModule(nextModule)
      } catch (cause) {
        if (!canceled) setError(cause instanceof Error ? cause.message : String(cause))
      }
    }

    void compileMdx()

    return () => {
      canceled = true
    }
  }, [file.content])

  const Mdx = module?.default

  return (
    <article className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {error ? (
        <pre className="overflow-auto rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </pre>
      ) : null}

      {Mdx ? (
        <div className="docuforge-mdx prose max-w-none dark:prose-invert">
          <Mdx components={mdxComponents} />
        </div>
      ) : null}
    </article>
  )
}
