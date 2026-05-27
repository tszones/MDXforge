export const IpcChannels = {
  window: {
    minimize: 'window:minimize',
    maximize: 'window:maximize',
    close: 'window:close',
    isMaximized: 'window:is-maximized'
  },
  mdx: {
    openFile: 'mdx:open-file',
    openFolder: 'mdx:open-folder',
    openPath: 'mdx:open-path',
    renamePath: 'mdx:rename-path',
    deletePath: 'mdx:delete-path',
    setWorkspaceExtensionsEnabled: 'mdx:set-workspace-extensions-enabled',
    copyRawSource: 'mdx:copy-raw-source',
    copyPath: 'mdx:copy-path',
    showInFolder: 'mdx:show-in-folder',
    openInVsCode: 'mdx:open-in-vscode',
    searchWorkspace: 'mdx:search-workspace',
    registerDefaultApp: 'mdx:register-default-app',
    isDefaultApp: 'mdx:is-default-app',
    fileOpened: 'mdx:file-opened',
    fileChanged: 'mdx:file-changed',
    fileOpenError: 'mdx:file-open-error',
    fileChangeError: 'mdx:file-change-error'
  },
  skills: {
    getWorkspace: 'skills:get-workspace',
    addLocalFolder: 'skills:add-local-folder',
    createLocal: 'skills:create-local',
    copyRules: 'skills:copy-rules',
    detectAgents: 'skills:detect-agents',
    openAgentPath: 'skills:open-agent-path',
    previewAgentInstall: 'skills:preview-agent-install',
    applyAgentInstall: 'skills:apply-agent-install',
    previewAgentDisable: 'skills:preview-agent-disable',
    applyAgentDisable: 'skills:apply-agent-disable',
    disableAgentInstall: 'skills:disable-agent-install'
  },
  settings: {
    get: 'settings:get',
    set: 'settings:set'
  },
  update: {
    getState: 'update:get-state',
    check: 'update:check',
    quitAndInstall: 'update:quit-and-install',
    state: 'update:state'
  }
} as const

export type IpcChannelGroup = typeof IpcChannels
export type IpcChannelValue<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? IpcChannelValue<T[keyof T]>
    : never
export type IpcChannel = IpcChannelValue<IpcChannelGroup>
