import type { RenderedMdxFile } from '../types'

interface MdxPreviewProps {
  file: RenderedMdxFile
}

export function MdxPreview({ file }: MdxPreviewProps): React.JSX.Element {
  const title = typeof file.frontmatter.title === 'string' ? file.frontmatter.title : file.name
  const description =
    typeof file.frontmatter.description === 'string' ? file.frontmatter.description : file.path

  return (
    <article className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: file.html }}
      />
    </article>
  )
}
