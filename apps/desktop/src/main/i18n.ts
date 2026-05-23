import { app } from 'electron'
import enMessages from '../../messages/en-US.json'
import zhMessages from '../../messages/zh-CN.json'
import { type AppLanguage, getAppSettings } from './settings'

type Locale = 'en-US' | 'zh-CN'
type MessageKey = Exclude<keyof typeof enMessages, '$schema'>
type MessageParams = Record<string, string | number>

const messages: Record<Locale, Record<MessageKey, string>> = {
  'en-US': enMessages,
  'zh-CN': zhMessages
}

export function mainMessage(key: MessageKey, params: MessageParams = {}): string {
  const template = messages[resolveMainLocale()][key] ?? messages['en-US'][key] ?? key

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

function resolveMainLocale(): Locale {
  const storedLanguage = getStoredLanguage()
  if (storedLanguage === 'zh-CN' || storedLanguage === 'en-US') return storedLanguage

  return getSystemLocale().toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

function getStoredLanguage(): AppLanguage {
  try {
    return getAppSettings().language
  } catch {
    return 'en-US'
  }
}

function getSystemLocale(): string {
  try {
    return app.getLocale()
  } catch {
    return 'en-US'
  }
}
