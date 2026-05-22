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

export interface AppSettings {
  theme: AppThemeName
  colorMode: AppColorMode
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
    theme: 'neutral',
    colorMode: 'light'
  }
})

export function getAppSettings(): AppSettings {
  return {
    theme: store.get('theme'),
    colorMode: store.get('colorMode')
  }
}

export function setAppSettings(settings: Partial<AppSettings>): AppSettings {
  if (settings.theme) store.set('theme', settings.theme)
  if (settings.colorMode) store.set('colorMode', settings.colorMode)
  return getAppSettings()
}
