export type MdxCompileDiagnosticKind = 'html-comment' | 'html-declaration'

export interface MdxCompileDiagnostic {
  kind: MdxCompileDiagnosticKind
  line: number
  column: number
  snippet: string
}

export function findMdxCompileDiagnostic(source: string): MdxCompileDiagnostic | null {
  const lines = source.split(/\r?\n/)
  let fence: { marker: '`' | '~'; length: number } | null = null

  for (const [index, line] of lines.entries()) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as '`' | '~'
      const length = fenceMatch[1].length
      if (!fence) fence = { marker, length }
      else if (marker === fence.marker && length >= fence.length) fence = null
      continue
    }
    if (fence) continue

    const visibleLine = line.replace(/`[^`\n]*`/g, '')
    const commentColumn = visibleLine.indexOf('<!--')
    if (commentColumn !== -1) {
      return createDiagnostic('html-comment', index, commentColumn, line)
    }

    const declarationMatch = /<![A-Za-z[]/.exec(visibleLine)
    if (declarationMatch) {
      return createDiagnostic('html-declaration', index, declarationMatch.index, line)
    }
  }

  return null
}

function createDiagnostic(
  kind: MdxCompileDiagnosticKind,
  lineIndex: number,
  columnIndex: number,
  sourceLine: string
): MdxCompileDiagnostic {
  return {
    kind,
    line: lineIndex + 1,
    column: columnIndex + 1,
    snippet: sourceLine.trim()
  }
}
