export const FUMADOCS_THEMES = [
  'neutral',
  'black',
  'vitepress',
  'dusk',
  'catppuccin',
  'ocean',
  'purple',
  'solar',
  'emerald',
  'ruby',
  'aspen'
] as const

export type FumadocsThemeName = (typeof FUMADOCS_THEMES)[number]
export type ColorMode = 'light' | 'dark'

export function isFumadocsThemeName(value: string): value is FumadocsThemeName {
  return FUMADOCS_THEMES.includes(value as FumadocsThemeName)
}

export function applyFumadocsTheme(theme: FumadocsThemeName, mode: ColorMode): void {
  const root = document.documentElement
  root.dataset.fdTheme = theme
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
}
