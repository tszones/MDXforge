import { useHotkeys } from '@tanstack/react-hotkeys'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { appHotkeys } from '../lib/hotkeys'
import { m } from '../paraglide/messages'

interface FindInPageBarProps {
  enabled: boolean
  sourceKey: string
}

export function FindInPageBar({ enabled, sourceKey }: FindInPageBarProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useHotkeys(
    [
      {
        hotkey: appHotkeys.findInFile,
        callback: () => {
          if (!enabled) return
          setOpen(true)
          window.setTimeout(() => inputRef.current?.select(), 0)
        },
        options: {
          enabled,
          meta: {
            name: 'Find in page',
            description: 'Find rendered text in the current document.'
          }
        }
      }
    ],
    { ignoreInputs: false }
  )

  useEffect(() => {
    setQuery('')
    setMatchCount(0)
    setActiveIndex(0)
    clearFindMarks()
  }, [sourceKey])

  useEffect(() => {
    if (!open) {
      clearFindMarks()
      setMatchCount(0)
      setActiveIndex(0)
      return
    }

    const count = markFindMatches(query)
    setMatchCount(count)
    setActiveIndex(0)
  }, [open, query, sourceKey])

  useEffect(() => {
    activateFindMatch(activeIndex)
  }, [activeIndex, matchCount])

  useEffect(() => () => clearFindMarks(), [])

  if (!open) return null

  function close(): void {
    setOpen(false)
    setQuery('')
  }

  function goToMatch(direction: 1 | -1): void {
    if (matchCount === 0) return
    setActiveIndex((current) => (current + direction + matchCount) % matchCount)
  }

  return (
    <div className="fixed top-14 right-4 z-[80] flex items-center gap-1 rounded-xl border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-xl">
      <div className="flex h-8 w-72 items-center gap-2 rounded-lg border bg-fd-background px-2 text-fd-muted-foreground focus-within:border-fd-primary/50 focus-within:text-fd-foreground">
        <Search className="size-4 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              close()
              return
            }
            if (event.key !== 'Enter') return
            event.preventDefault()
            goToMatch(event.shiftKey ? -1 : 1)
          }}
          placeholder={m.find_in_page_placeholder()}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-fd-muted-foreground"
          autoFocus
        />
        <span className="shrink-0 text-xs tabular-nums text-fd-muted-foreground">
          {query.trim()
            ? m.find_in_page_count({ current: matchCount ? activeIndex + 1 : 0, total: matchCount })
            : m.find_in_page_empty_count()}
        </span>
      </div>
      <button
        type="button"
        onClick={() => goToMatch(-1)}
        disabled={matchCount === 0}
        aria-label={m.find_in_page_previous()}
        className="flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-40"
      >
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => goToMatch(1)}
        disabled={matchCount === 0}
        aria-label={m.find_in_page_next()}
        className="flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-40"
      >
        <ChevronDown className="size-4" />
      </button>
      <button
        type="button"
        onClick={close}
        aria-label={m.find_in_page_close()}
        className="flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

function markFindMatches(query: string): number {
  clearFindMarks()
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return 0

  const root = document.getElementById('nd-page')
  if (!root) return 0

  const regex = new RegExp(escapeRegExp(trimmedQuery), 'gi')
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || parent.closest('[data-mdxforge-find-mark]')) return NodeFilter.FILTER_REJECT
      if (!node.nodeValue || !regex.test(node.nodeValue)) return NodeFilter.FILTER_REJECT
      regex.lastIndex = 0
      return NodeFilter.FILTER_ACCEPT
    }
  })

  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

  let count = 0
  for (const node of textNodes) {
    const text = node.nodeValue ?? ''
    const fragment = document.createDocumentFragment()
    let lastIndex = 0

    regex.lastIndex = 0
    for (const match of text.matchAll(regex)) {
      const index = match.index ?? 0
      const value = match[0]
      if (index > lastIndex) fragment.append(document.createTextNode(text.slice(lastIndex, index)))

      const mark = document.createElement('mark')
      mark.dataset.mdxforgeFindMark = 'true'
      mark.dataset.findIndex = String(count)
      mark.className = 'rounded-sm bg-yellow-300 px-0.5 text-yellow-950 data-[active=true]:bg-fd-primary data-[active=true]:text-fd-primary-foreground'
      mark.textContent = value
      fragment.append(mark)
      count += 1
      lastIndex = index + value.length
    }

    if (lastIndex < text.length) fragment.append(document.createTextNode(text.slice(lastIndex)))
    node.replaceWith(fragment)
  }

  return count
}

function activateFindMatch(index: number): void {
  const marks = Array.from(document.querySelectorAll<HTMLElement>('[data-mdxforge-find-mark]'))
  for (const [markIndex, mark] of marks.entries()) {
    mark.dataset.active = String(markIndex === index)
  }

  marks[index]?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
}

function clearFindMarks(): void {
  const marks = Array.from(document.querySelectorAll<HTMLElement>('[data-mdxforge-find-mark]'))
  for (const mark of marks) {
    mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
