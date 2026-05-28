import { dialog } from 'electron'
import { mainMessage } from './i18n'
import {
  getLastOpenFolder,
  getLastOpenPath,
  setLastOpenFolder,
  setLastOpenPath
} from './recent-state'
import { type MdxWorkspace, readMdxWorkspace } from './workspace-reader'

export async function openMdxFile(): Promise<MdxWorkspace | null> {
  const result = await dialog.showOpenDialog({
    title: mainMessage('dialog_open_mdx_file'),
    defaultPath: getLastOpenPath(),
    properties: ['openFile'],
    filters: [
      {
        name: mainMessage('dialog_filter_mdx_markdown'),
        extensions: ['mdx', 'md', 'html', 'htm', 'pdf']
      },
      { name: mainMessage('dialog_filter_all_files'), extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  setLastOpenPath(filePath)

  return readMdxWorkspace(filePath)
}

export async function openMdxFolder(): Promise<MdxWorkspace | null> {
  const result = await dialog.showOpenDialog({
    title: mainMessage('dialog_open_mdx_folder'),
    defaultPath: getLastOpenFolder() ?? getLastOpenPath(),
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const folderPath = result.filePaths[0]
  setLastOpenFolder(folderPath)

  return readMdxWorkspace(folderPath)
}
