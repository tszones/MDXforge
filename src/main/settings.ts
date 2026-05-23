import electronStoreModule from 'electron-store'

export type AppThemeName =
  | 'neutral'
  | 'black'
  | 'vitepress'
  | 'dusk'
  | 'catppuccin'
  | 'ocean'
  | 'purple'
  | 'solar'
  | 'emerald'
  | 'ruby'
  | 'aspen'

export type AppColorMode = 'light' | 'dark'
export type AppLanguage = 'system' | 'zh-CN' | 'en-US'
export type AppFontName = 'system' | 'bricolage' | 'serif' | 'mono'

export interface AppSettings {
  theme: AppThemeName
  colorMode: AppColorMode
  language: AppLanguage
  font: AppFontName
}

type StoreConstructor = new <T extends object>(options: {
  defaults: T
}) => {
  get<Key extends keyof T>(key: Key): T[Key]
  set<Key extends keyof T>(key: Key, value: T[Key]): void
}

const ElectronStore = (
  'default' in electronStoreModule ? electronStoreModule.default : electronStoreModule
) as StoreConstructor

const store = new ElectronStore<AppSettings>({
  defaults: {
    theme: 'purple',
    colorMode: 'dark',
    language: 'en-US',
    font: 'system'
  }
})

export function getAppSettings(): AppSettings {
  return {
    theme: store.get('theme'),
    colorMode: store.get('colorMode'),
    language: store.get('language'),
    font: store.get('font')
  }
}

export function setAppSettings(settings: Partial<AppSettings>): AppSettings {
  if (settings.theme) store.set('theme', settings.theme)
  if (settings.colorMode) store.set('colorMode', settings.colorMode)
  if (settings.language) store.set('language', settings.language)
  if (settings.font) store.set('font', settings.font)
  return getAppSettings()
}
