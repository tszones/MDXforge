interface TreeNode {
  type?: string
  value?: string
  url?: string
  title?: string | null
  children?: TreeNode[]
}

export function remarkWikiLinks() {
  return function transformWikiLinks(tree: TreeNode): void {
    rewriteWikiLinks(tree)
  }
}

function rewriteWikiLinks(node: TreeNode): void {
  if (!node.children || shouldSkipChildren(node)) return

  const children: TreeNode[] = []

  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string') {
      children.push(...splitWikiLinkText(child.value))
      continue
    }

    rewriteWikiLinks(child)
    children.push(child)
  }

  node.children = children
}

function splitWikiLinkText(value: string): TreeNode[] {
  const nodes: TreeNode[] = []
  const pattern = /\[\[([^\]\n|]+)(?:\|([^\]\n]+))?\]\]/g
  let lastIndex = 0

  for (const match of value.matchAll(pattern)) {
    const matchIndex = match.index ?? 0
    const href = (match[1] ?? '').trim()
    const label = (match[2] ?? match[1] ?? '').trim()

    if (!href || !label) continue
    if (matchIndex > lastIndex)
      nodes.push({ type: 'text', value: value.slice(lastIndex, matchIndex) })

    nodes.push({
      type: 'link',
      url: href,
      title: null,
      children: [{ type: 'text', value: label }]
    })

    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex === 0) return [{ type: 'text', value }]
  if (lastIndex < value.length) nodes.push({ type: 'text', value: value.slice(lastIndex) })

  return nodes
}

function shouldSkipChildren(node: TreeNode): boolean {
  return node.type === 'link' || node.type === 'linkReference'
}
