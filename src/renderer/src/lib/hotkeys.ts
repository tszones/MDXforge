import type { RegisterableHotkey } from '@tanstack/react-hotkeys'

export const appHotkeys = {
  openFile: 'Mod+O',
  openFolder: 'Mod+Shift+O',
  openSettings: 'Mod+,',
  closeSettings: 'Escape',
  focusWorkspaceSearch: 'Mod+F'
} as const satisfies Record<string, RegisterableHotkey>
