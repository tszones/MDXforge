import { ArrowLeft, Check, Languages, Moon, Palette, Settings, Sun } from 'lucide-react'
import { type ColorMode, FUMADOCS_THEMES, type FumadocsThemeName } from '../lib/theme'
import { m } from '../paraglide/messages'
import { APP_LANGUAGE_OPTIONS, type AppLanguage } from '../types'

const THEME_META: Record<FumadocsThemeName, { colors: [string, string, string, string] }> = {
  neutral: {
    colors: ['hsl(0 0% 96%)', 'hsl(0 0% 9%)', 'hsl(0 0% 93.1%)', 'hsl(0 0% 82%)']
  },
  black: {
    colors: ['hsl(0 0% 98%)', 'hsl(0 0% 9%)', 'hsl(0 0% 96.1%)', 'hsl(0 0% 94.1%)']
  },
  vitepress: {
    colors: ['hsl(0 0% 100%)', 'hsl(226 55% 45%)', 'hsl(240 6% 97%)', 'hsl(0 0% 94.1%)']
  },
  dusk: {
    colors: ['hsl(250 20% 92%)', 'hsl(340 40% 48%)', 'hsl(250 40% 94%)', 'hsl(250 30% 90%)']
  },
  catppuccin: {
    colors: ['hsl(220 23% 95%)', 'hsl(266 85% 58%)', 'hsl(220 22% 92%)', 'hsl(223 16% 83%)']
  },
  ocean: {
    colors: ['hsl(0 0% 98%)', 'hsl(210 80% 20.2%)', 'hsl(220 90% 96.1%)', 'hsl(220 50% 94.1%)']
  },
  purple: {
    colors: ['hsl(256 100% 96%)', 'hsl(270 100% 52%)', 'hsl(270 60% 90%)', 'hsl(270 40% 88%)']
  },
  solar: {
    colors: ['hsl(0 0% 97%)', 'oklch(0.487 0.083 262.691)', 'hsl(0 0% 96.1%)', 'hsl(0 0% 82%)']
  },
  emerald: {
    colors: ['hsl(165 45% 96%)', 'hsl(168 70% 40%)', 'hsl(168 45% 88%)', 'hsl(165 50% 90%)']
  },
  ruby: {
    colors: ['hsl(0 0% 98%)', 'hsl(348 85% 45%)', 'hsl(348 55% 92%)', 'hsl(348 70% 95%)']
  },
  aspen: {
    colors: ['hsl(75 45% 96%)', 'hsl(80 60% 40%)', 'hsl(80 45% 88%)', 'hsl(75 50% 90%)']
  }
}

interface SettingsPageProps {
  theme: FumadocsThemeName
  mode: ColorMode
  language: AppLanguage
  onThemeChange: (theme: FumadocsThemeName) => void
  onModeChange: (mode: ColorMode) => void
  onLanguageChange: (language: AppLanguage) => void
  onBack: () => void
}

export function SettingsPage({
  theme,
  mode,
  language,
  onThemeChange,
  onModeChange,
  onLanguageChange,
  onBack
}: SettingsPageProps): React.JSX.Element {
  return (
    <section className="flex min-h-0 flex-1 overflow-auto bg-fd-background p-6 text-fd-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b pb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <ArrowLeft className="size-4" />
            {m.settings_back_home()}
          </button>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
            <Settings className="size-4" />
            {m.settings_label()}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{m.settings_appearance_title()}</h1>
          <p className="max-w-2xl text-fd-muted-foreground">
            {m.settings_appearance_description()}
          </p>
        </header>

        <section className="grid gap-3 rounded-lg border bg-fd-card p-4">
          <div className="flex items-center gap-2 font-medium">
            <Sun className="size-4" />
            {m.settings_color_mode()}
          </div>
          <div className="flex flex-wrap gap-2">
            <OptionButton active={mode === 'light'} onClick={() => onModeChange('light')}>
              <Sun className="size-4" />
              {m.settings_light()}
            </OptionButton>
            <OptionButton active={mode === 'dark'} onClick={() => onModeChange('dark')}>
              <Moon className="size-4" />
              {m.settings_dark()}
            </OptionButton>
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border bg-fd-card p-4">
          <div>
            <div className="flex items-center gap-2 font-medium">
              <Languages className="size-4" />
              {m.settings_language()}
            </div>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {m.settings_language_description()}
            </p>
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

        <section className="grid gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Palette className="size-4" />
            {m.settings_fumadocs_theme()}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FUMADOCS_THEMES.map((item) => (
              <ThemeCard
                key={item}
                name={item}
                active={item === theme}
                mode={mode}
                onClick={() => onThemeChange(item)}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function OptionButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:border-fd-primary data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
    >
      {children}
    </button>
  )
}

function languageLabel(language: AppLanguage): string {
  if (language === 'zh-CN') return m.settings_language_chinese()
  if (language === 'en-US') return m.settings_language_english()
  return m.settings_language_system()
}

function ThemeCard({
  name,
  active,
  mode,
  onClick
}: {
  name: FumadocsThemeName
  active: boolean
  mode: ColorMode
  onClick: () => void
}): React.JSX.Element {
  const meta = THEME_META[name]
  const swatchLabels = [
    m.settings_swatch_background(),
    m.settings_swatch_primary(),
    m.settings_swatch_secondary(),
    m.settings_swatch_accent()
  ]

  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="group rounded-lg border bg-fd-card p-4 text-start transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/30 data-[active=true]:border-fd-primary data-[active=true]:bg-fd-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-medium">{themeLabel(name)}</span>
          <code className="mt-1 block text-xs text-fd-muted-foreground">{name}</code>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-fd-background px-2 py-0.5 text-xs text-fd-muted-foreground">
          {active ? <Check className="size-3" /> : null}
          {active ? m.settings_current() : m.settings_select()}
        </span>
      </div>
      <div className="mt-3 flex overflow-hidden rounded-md border">
        {swatchLabels.map((label, index) => (
          <span
            key={label}
            className="h-6 flex-1"
            style={{ background: meta.colors[index] }}
            title={label}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-fd-muted-foreground">{themeDescription(name)}</p>
      <div className="mt-4 grid grid-cols-4 gap-1.5 text-[10px] text-fd-muted-foreground">
        {swatchLabels.map((label, index) => (
          <div key={label} className="min-w-0">
            <div
              className="mb-1 h-5 rounded-sm border"
              style={{ background: meta.colors[index] }}
            />
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-fd-muted-foreground">
        {m.settings_preview_mode({
          mode: mode === 'dark' ? m.settings_dark() : m.settings_light()
        })}
      </p>
    </button>
  )
}

function themeLabel(name: FumadocsThemeName): string {
  switch (name) {
    case 'black':
      return m.theme_black_label()
    case 'vitepress':
      return m.theme_vitepress_label()
    case 'dusk':
      return m.theme_dusk_label()
    case 'catppuccin':
      return m.theme_catppuccin_label()
    case 'ocean':
      return m.theme_ocean_label()
    case 'purple':
      return m.theme_purple_label()
    case 'solar':
      return m.theme_solar_label()
    case 'emerald':
      return m.theme_emerald_label()
    case 'ruby':
      return m.theme_ruby_label()
    case 'aspen':
      return m.theme_aspen_label()
    case 'neutral':
      return m.theme_neutral_label()
  }
}

function themeDescription(name: FumadocsThemeName): string {
  switch (name) {
    case 'black':
      return m.theme_black_description()
    case 'vitepress':
      return m.theme_vitepress_description()
    case 'dusk':
      return m.theme_dusk_description()
    case 'catppuccin':
      return m.theme_catppuccin_description()
    case 'ocean':
      return m.theme_ocean_description()
    case 'purple':
      return m.theme_purple_description()
    case 'solar':
      return m.theme_solar_description()
    case 'emerald':
      return m.theme_emerald_description()
    case 'ruby':
      return m.theme_ruby_description()
    case 'aspen':
      return m.theme_aspen_description()
    case 'neutral':
      return m.theme_neutral_description()
  }
}
