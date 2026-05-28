import { compile } from '@mdx-js/mdx'
import { mainMessage } from './i18n'
import { remarkLocalImages } from './local-images'
import { findMdxCompileDiagnostic } from './mdx-diagnostics'
import { getMDXForgeRehypePlugins, getMDXForgeRemarkPlugins } from './mdx-options'
import { remarkWikiLinks } from './wiki-links'

export async function compileMdxSource(
  source: string,
  localImageContext: { documentPath: string; workspaceRoot?: string }
): Promise<string> {
  return String(
    await compile(source, {
      outputFormat: 'function-body',
      development: false,
      remarkPlugins: [
        [remarkLocalImages, localImageContext],
        remarkWikiLinks,
        ...getMDXForgeRemarkPlugins()
      ],
      rehypePlugins: getMDXForgeRehypePlugins()
    })
  )
}

export function formatMdxError(cause: unknown, source?: string): string {
  const message = cause instanceof Error ? cause.message : String(cause)
  const diagnostic = source ? findMdxCompileDiagnostic(source) : null
  const suggestion = diagnostic
    ? `\n\n${mainMessage('error_mdx_compile_location', {
        line: diagnostic.line,
        column: diagnostic.column,
        snippet: diagnostic.snippet
      })}\n${mainMessage(
        diagnostic.kind === 'html-comment'
          ? 'error_mdx_compile_html_comment_hint'
          : 'error_mdx_compile_html_declaration_hint'
      )}`
    : ''

  return mainMessage('error_mdx_compile', { message: `${message}${suggestion}` })
}
