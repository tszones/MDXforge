export const APP_FONT_OPTIONS = ['system', 'bricolage', 'serif', 'mono'] as const

export type AppFontName = (typeof APP_FONT_OPTIONS)[number]

const FONT_STACKS: Record<AppFontName, string> = {
  system:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  bricolage:
    '"Bricolage Grotesque", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", "Songti SC", SimSun, serif',
  mono: 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, "Microsoft YaHei Mono", monospace'
}

export function isAppFontName(value: unknown): value is AppFontName {
  return APP_FONT_OPTIONS.includes(value as AppFontName)
}

export function normalizeStoredFont(value: unknown): AppFontName {
  return isAppFontName(value) ? value : 'system'
}

export function applyAppFont(font: AppFontName): void {
  const root = document.documentElement
  root.dataset.appFont = font
  root.style.setProperty('--font-custom', FONT_STACKS[font])
}
