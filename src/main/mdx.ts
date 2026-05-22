import { compile } from '@mdx-js/mdx'
import { app, dialog } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import matter from 'gray-matter'
import { dirname } from 'path'
import * as React from 'react'
import { createElement } from 'react'
import * as runtime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { mdxComponents } from './mdx-components'

const wrappedMdxComponents = {
  ...mdxComponents,
  wrapper({ children }: { children?: React.ReactNode }) {
    return createElement(React.Fragment, null, children)
  }
}

const statePath = () => `${app.getPath('userData')}/state.json`

interface MdxState {
  lastOpenDir?: string
  lastOpenFile?: string
}

function readState(): MdxState {
  try {
    return JSON.parse(readFileSync(statePath(), 'utf-8')) as MdxState
  } catch {
    return {}
  }
}

function getLastOpenPath(): string {
  return readState().lastOpenDir ?? app.getPath('documents')
}

export function getLastOpenFile(): string | null {
  const filePath = readState().lastOpenFile
  return filePath && existsSync(filePath) ? filePath : null
}

export function setLastOpenPath(filePath: string): void {
  try {
    writeFileSync(
      statePath(),
      JSON.stringify({ lastOpenDir: dirname(filePath), lastOpenFile: filePath }, null, 2),
      'utf-8'
    )
  } catch {
    // ignore
  }
}

export interface RenderedMdxFile {
  path: string
  name: string
  frontmatter: Record<string, unknown>
  html: string
  raw: string
}

export async function openMdxFile(): Promise<RenderedMdxFile | null> {
  const result = await dialog.showOpenDialog({
    title: 'Open MDX file',
    defaultPath: getLastOpenPath(),
    properties: ['openFile'],
    filters: [
      { name: 'MDX / Markdown', extensions: ['mdx', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  setLastOpenPath(filePath)

  return renderMdxFile(filePath)
}

export async function renderMdxFile(filePath: string): Promise<RenderedMdxFile> {
  const raw = readFileSync(filePath, 'utf-8')
  const parsed = matter(raw)
  const compiled = await compileMdx(parsed.content)
  const module = evaluateMdx(compiled)
  const html = renderToStaticMarkup(
    createElement(module.default, { components: wrappedMdxComponents })
  )

  return {
    path: filePath,
    name: filePath.split(/[\\/]/).pop() ?? filePath,
    frontmatter: parsed.data,
    html,
    raw
  }
}

async function compileMdx(content: string): Promise<string> {
  const compiled = await compile(content, {
    outputFormat: 'function-body',
    development: false
  })

  return String(compiled)
}

function evaluateMdx(code: string): { default: React.ComponentType<{ components?: unknown }> } {
  const fn = new Function(String.raw`${code}`)
  return fn(runtime)
}
