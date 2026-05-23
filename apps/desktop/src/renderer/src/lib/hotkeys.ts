import type { RegisterableHotkey } from '@tanstack/react-hotkeys'

export const appHotkeys = {
  openFile: 'Mod+O',
  openFolder: 'Mod+Shift+O',
  openSettings: 'Mod+,',
  closeSettings: 'Escape',
  findInFile: 'Mod+F',
  searchWorkspace: 'Mod+Shift+F',
  quickOpenFile: 'Mod+P'
} as const satisfies Record<string, RegisterableHotkey>
