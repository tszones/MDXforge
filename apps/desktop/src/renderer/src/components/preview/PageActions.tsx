import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { m } from '../../paraglide/messages'

export function PageActions({
  sourceCopyState,
  pathCopyState,
  onCopyRawSource,
  onCopyDocumentPath
}: {
  sourceCopyState: 'idle' | 'copied' | 'error'
  pathCopyState: 'idle' | 'copied' | 'error'
  onCopyRawSource: () => void
  onCopyDocumentPath: () => void
}): React.JSX.Element {
  return (
    <div className="flex flex-row items-center gap-2 border-b pb-5 pt-0">
      <button
        type="button"
        onClick={onCopyRawSource}
        aria-label={m.actions_copy_raw_source()}
        className={buttonVariants({
          color: 'secondary',
          size: 'sm',
          className:
            'gap-2 data-[state=copied]:border-fd-primary/40 data-[state=copied]:bg-fd-primary/10 data-[state=copied]:text-fd-primary data-[state=error]:border-fd-error/40 data-[state=error]:bg-fd-error/10 data-[state=error]:text-fd-error [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground'
        })}
        data-state={sourceCopyState}
      >
        {sourceCopyState === 'copied' ? <Check /> : <Copy />}
        {sourceCopyState === 'copied'
          ? m.actions_copied_raw_source()
          : sourceCopyState === 'error'
            ? m.actions_copy_raw_source_failed()
            : m.actions_copy_raw_source()}
      </button>
      <button
        type="button"
        onClick={onCopyDocumentPath}
        aria-label={m.preview_copy_file_path()}
        className={buttonVariants({
          color: 'secondary',
          size: 'sm',
          className:
            'gap-2 data-[state=copied]:border-fd-primary/40 data-[state=copied]:bg-fd-primary/10 data-[state=copied]:text-fd-primary data-[state=error]:border-fd-error/40 data-[state=error]:bg-fd-error/10 data-[state=error]:text-fd-error [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground'
        })}
        data-state={pathCopyState}
      >
        {pathCopyState === 'copied' ? <Check /> : <Copy />}
        {pathCopyState === 'copied'
          ? m.preview_file_path_copied()
          : pathCopyState === 'error'
            ? m.preview_file_path_copy_failed()
            : m.preview_copy_file_path()}
      </button>
    </div>
  )
}
