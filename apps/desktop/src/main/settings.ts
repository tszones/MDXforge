import electronStoreModule from 'electron-store'
import {
  defaultViewableDocumentExtensions,
  normalizeViewableDocumentExtensions
} from '../shared/viewable-documents'

export interface AppWindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized?: boolean
}

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
  viewableDocumentExtensions: string[]
  windowState: AppWindowState
}

type Store = {
  get<Key extends keyof AppSettings>(key: Key): AppSettings[Key]
  set<Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]): void
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

const defaultAppSettings: AppSettings = {
  theme: 'purple',
  colorMode: 'dark',
  language: 'en-US',
  font: 'system',
  viewableDocumentExtensions: [...defaultViewableDocumentExtensions],
  windowState: {
    width: 900,
    height: 670
  }
}

let store: Store | null = null

function createMemoryStore(defaults: AppSettings): Store {
  const values = { ...defaults }
  return {
    get: (key) => values[key],
    set: (key, value) => {
      values[key] = value
    }
  }
}

function getStore(): Store {
  if (store) return store

  try {
    store = new ElectronStore<AppSettings>({
      defaults: defaultAppSettings
    })
  } catch {
    store = createMemoryStore(defaultAppSettings)
  }

  return store
}

export function getAppSettings(): AppSettings {
  const store = getStore()
  return {
    theme: store.get('theme'),
    colorMode: store.get('colorMode'),
    language: store.get('language'),
    font: store.get('font'),
    viewableDocumentExtensions: normalizeViewableDocumentExtensions(
      store.get('viewableDocumentExtensions')
    ),
    windowState: store.get('windowState')
  }
}

export function setAppSettings(settings: Partial<AppSettings>): AppSettings {
  const store = getStore()
  if (settings.theme) store.set('theme', settings.theme)
  if (settings.colorMode) store.set('colorMode', settings.colorMode)
  if (settings.language) store.set('language', settings.language)
  if (settings.font) store.set('font', settings.font)
  if (settings.viewableDocumentExtensions) {
    store.set(
      'viewableDocumentExtensions',
      normalizeViewableDocumentExtensions(settings.viewableDocumentExtensions)
    )
  }
  if (settings.windowState) store.set('windowState', settings.windowState)
  return getAppSettings()
}

export function getWindowState(): AppWindowState {
  return getStore().get('windowState')
}

export function setWindowState(windowState: AppWindowState): void {
  getStore().set('windowState', windowState)
}
