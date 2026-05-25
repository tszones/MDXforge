import { Languages } from 'lucide-react'
import { APP_LANGUAGE_OPTIONS, type AppLanguage } from '../../types'
import { m } from '../../paraglide/messages'
import { OptionButton } from './OptionButton'

export function LanguageSettingsPage({
  language,
  onLanguageChange
}: {
  language: AppLanguage
  onLanguageChange: (language: AppLanguage) => void
}): React.JSX.Element {
  return (
    <section className="grid gap-3 rounded-xl border bg-fd-card p-4">
      <div>
        <div className="flex items-center gap-2 font-medium">
          <Languages className="size-4" />
          {m.settings_language()}
        </div>
        <p className="mt-1 text-sm text-fd-muted-foreground">{m.settings_language_description()}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {APP_LANGUAGE_OPTIONS.map((item) => (
          <OptionButton
            key={item}
            active={language === item}
            onClick={() => onLanguageChange(item)}
          >
            {languageLabel(item)}
          </OptionButton>
        ))}
      </div>
    </section>
  )
}

function languageLabel(language: AppLanguage): string {
  if (language === 'zh-CN') return m.settings_language_chinese()
  if (language === 'en-US') return m.settings_language_english()
  return m.settings_language_system()
}
