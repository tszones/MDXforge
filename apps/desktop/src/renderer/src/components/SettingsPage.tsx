import { ArrowLeft, Check, Copy, FolderPlus, Languages, Moon, Palette, Settings, Sparkles, Sun, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { APP_FONT_OPTIONS, type AppFontName } from '../lib/font'
import { type ColorMode, FUMADOCS_THEMES, type FumadocsThemeName } from '../lib/theme'
import { m } from '../paraglide/messages'
import { APP_LANGUAGE_OPTIONS, type AppLanguage, type WorkspaceSkillsState } from '../types'
import { UpdateSettingsCard } from './UpdateSettingsCard'

const THEME_META: Record<FumadocsThemeName, { colors: [string, string, string, string] }> = {
  neutral: { colors: ['hsl(0 0% 96%)', 'hsl(0 0% 9%)', 'hsl(0 0% 93.1%)', 'hsl(0 0% 82%)'] },
  black: { colors: ['hsl(0 0% 98%)', 'hsl(0 0% 9%)', 'hsl(0 0% 96.1%)', 'hsl(0 0% 94.1%)'] },
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
  ruby: { colors: ['hsl(0 0% 98%)', 'hsl(348 85% 45%)', 'hsl(348 55% 92%)', 'hsl(348 70% 95%)'] },
  aspen: { colors: ['hsl(75 45% 96%)', 'hsl(80 60% 40%)', 'hsl(80 45% 88%)', 'hsl(75 50% 90%)'] }
}

interface SettingsPageProps {
  page: SettingsRoute
  theme: FumadocsThemeName
  mode: ColorMode
  language: AppLanguage
  font: AppFontName
  onThemeChange: (theme: FumadocsThemeName) => void
  onModeChange: (mode: ColorMode) => void
  onLanguageChange: (language: AppLanguage) => void
  onFontChange: (font: AppFontName) => void
  workspaceRoot?: string
  onBack: () => void
}

export type SettingsRoute = 'language' | 'appearance' | 'updates' | 'skills'

export function SettingsPage({
  page,
  theme,
  mode,
  language,
  font,
  onThemeChange,
  onModeChange,
  onLanguageChange,
  onFontChange,
  workspaceRoot,
  onBack
}: SettingsPageProps): React.JSX.Element {
  const pageTitle = settingsPageTitle(page)
  const pageDescription = settingsPageDescription(page)

  return (
    <section className="flex min-h-0 flex-1 overflow-auto bg-fd-background p-6 text-fd-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-0 lg:h-fit">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <ArrowLeft className="size-4" />
            {m.settings_back_home()}
          </button>
          <nav className="grid gap-1 rounded-xl border bg-fd-card p-2 text-sm">
            <SettingsNavLink to="/settings/language">{m.settings_language_tab()}</SettingsNavLink>
            <SettingsNavLink to="/settings/appearance">
              {m.settings_appearance_tab()}
            </SettingsNavLink>
            <SettingsNavLink to="/settings/updates">{m.settings_updates_title()}</SettingsNavLink>
            <SettingsNavLink to="/settings/skills">{m.settings_skills_title()}</SettingsNavLink>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="border-b pb-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
              <Settings className="size-4" />
              {m.settings_label()}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-fd-muted-foreground">{pageDescription}</p>
          </header>

          {page === 'language' ? (
            <LanguageSettingsPage language={language} onLanguageChange={onLanguageChange} />
          ) : null}
          {page === 'appearance' ? (
            <AppearanceSettingsPage
              theme={theme}
              mode={mode}
              font={font}
              onThemeChange={onThemeChange}
              onModeChange={onModeChange}
              onFontChange={onFontChange}
            />
          ) : null}
          {page === 'updates' ? <UpdateSettingsCard /> : null}
          {page === 'skills' ? <SkillsSettingsPage workspaceRoot={workspaceRoot} /> : null}
        </div>
      </div>
    </section>
  )
}

function SettingsNavLink({
  to,
  children
}: {
  to: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-lg px-3 py-2 transition-colors',
          isActive
            ? 'bg-fd-primary/10 text-fd-primary'
            : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

function LanguageSettingsPage({
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

function AppearanceSettingsPage({
  theme,
  mode,
  font,
  onThemeChange,
  onModeChange,
  onFontChange
}: {
  theme: FumadocsThemeName
  mode: ColorMode
  font: AppFontName
  onThemeChange: (theme: FumadocsThemeName) => void
  onModeChange: (mode: ColorMode) => void
  onFontChange: (font: AppFontName) => void
}): React.JSX.Element {
  return (
    <section className="grid gap-6">
      <div className="grid gap-3 rounded-xl border bg-fd-card p-4">
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
      </div>

      <section className="grid gap-4 rounded-xl border bg-fd-card p-4">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Type className="size-4" />
            {m.settings_font()}
          </div>
          <p className="mt-1 text-sm text-fd-muted-foreground">{m.settings_font_description()}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {APP_FONT_OPTIONS.map((item) => (
            <FontCard
              key={item}
              name={item}
              active={font === item}
              onClick={() => onFontChange(item)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center gap-2 font-medium">
          <Palette className="size-4" />
          {m.settings_fumadocs_theme()}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
    </section>
  )
}

function SkillsSettingsPage({ workspaceRoot }: { workspaceRoot?: string }): React.JSX.Element {
  const [skillsState, setSkillsState] = useState<WorkspaceSkillsState | null>(null)
  const [loading, setLoading] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [newSkillName, setNewSkillName] = useState('local-skill')
  const [newSkillType, setNewSkillType] = useState<'writing' | 'component' | 'template'>('writing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    void window.api
      .getWorkspaceSkills(workspaceRoot)
      .then(setSkillsState)
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false))
  }, [workspaceRoot])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1600)
    return () => window.clearTimeout(timer)
  }, [copyState])

  async function addLocalFolder(): Promise<void> {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    try {
      const nextState = await window.api.addLocalSkillFolder(workspaceRoot)
      if (nextState) setSkillsState(nextState)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function createLocalSkill(): Promise<void> {
    if (!workspaceRoot) return
    setLoading(true)
    setError(null)
    try {
      setSkillsState(await window.api.createLocalSkill(workspaceRoot, newSkillName, newSkillType))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  async function copyRules(): Promise<void> {
    if (!skillsState?.mergedRules) return
    try {
      await window.api.copySkillRules(skillsState.mergedRules)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  if (!workspaceRoot) {
    return (
      <section className="rounded-xl border bg-fd-card p-5">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="size-4" />
          {m.settings_skills_title()}
        </div>
        <p className="mt-2 text-sm text-fd-muted-foreground">{m.skills_open_workspace_empty()}</p>
      </section>
    )
  }

  const activeCount = skillsState?.skills.filter((skill) => skill.status === 'active').length ?? 0

  return (
    <section className="grid gap-4">
      <div className="rounded-xl border bg-fd-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="size-4" />
              {m.skills_active_title()}
            </div>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {m.skills_workspace_root({ path: workspaceRoot })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void addLocalFolder()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <FolderPlus className="size-4" />
              {m.skills_add_local_folder()}
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          {m.skills_active_count({ count: activeCount })}
        </p>
      </div>

      <section className="rounded-xl border bg-fd-card p-4">
        <h2 className="font-medium">{m.skills_create_local_title()}</h2>
        <p className="mt-1 text-sm text-fd-muted-foreground">{m.skills_create_local_description()}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <input
            value={newSkillName}
            onChange={(event) => setNewSkillName(event.target.value)}
            placeholder="local-dashboard"
            className="rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary"
          />
          <select
            value={newSkillType}
            onChange={(event) =>
              setNewSkillType(event.target.value as 'writing' | 'component' | 'template')
            }
            className="rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary"
          >
            <option value="writing">{m.skills_type_writing()}</option>
            <option value="component">{m.skills_type_component()}</option>
            <option value="template">{m.skills_type_template()}</option>
          </select>
          <button
            type="button"
            onClick={() => void createLocalSkill()}
            disabled={loading || !newSkillName.trim()}
            className="rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
          >
            {m.skills_create_local()}
          </button>
        </div>
      </section>

      {error ? <pre className="overflow-auto rounded-lg border bg-fd-error/10 p-3 text-sm text-fd-error">{error}</pre> : null}

      <div className="grid gap-3">
        {skillsState?.skills.length ? (
          skillsState.skills.map((skill) => (
            <article key={skill.source} className="rounded-xl border bg-fd-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-medium">{skill.title}</h2>
                  <p className="mt-1 text-xs text-fd-muted-foreground">
                    {skill.name}@{skill.version} · {skill.source}
                  </p>
                </div>
                <span className="rounded-md border bg-fd-background px-2 py-1 text-xs text-fd-muted-foreground">
                  {skill.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skill.types.map((type) => (
                  <span key={type} className="rounded-md bg-fd-secondary px-2 py-1 text-xs">
                    {type}
                  </span>
                ))}
                {skill.components.map((component) => (
                  <span key={component} className="rounded-md border px-2 py-1 text-xs">
                    {component}
                  </span>
                ))}
              </div>
              {skill.permissions.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-fd-muted-foreground">
                  {skill.permissions.map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              ) : null}
              {skill.reason ? <p className="mt-3 text-xs text-fd-error">{skill.reason}</p> : null}
            </article>
          ))
        ) : (
          <div className="rounded-xl border bg-fd-card p-4 text-sm text-fd-muted-foreground">
            {loading ? m.skills_loading() : m.skills_empty()}
          </div>
        )}
      </div>

      <section className="rounded-xl border bg-fd-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">{m.skills_ai_rules_title()}</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">{m.skills_ai_rules_description()}</p>
          </div>
          <button
            type="button"
            onClick={() => void copyRules()}
            disabled={!skillsState?.mergedRules}
            data-state={copyState}
            className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-60 data-[state=copied]:border-fd-primary/40 data-[state=copied]:text-fd-primary data-[state=error]:text-fd-error"
          >
            {copyState === 'copied' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copyState === 'copied'
              ? m.skills_rules_copied()
              : copyState === 'error'
                ? m.actions_copy_raw_source_failed()
                : m.skills_copy_rules()}
          </button>
        </div>
        <pre className="mt-4 max-h-80 overflow-auto rounded-lg border bg-fd-background p-3 text-xs text-fd-muted-foreground">
          {skillsState?.mergedRules || m.skills_no_rules()}
        </pre>
      </section>
    </section>
  )
}

function settingsPageTitle(page: SettingsRoute): string {
  if (page === 'language') return m.settings_language_tab()
  if (page === 'appearance') return m.settings_appearance_title()
  if (page === 'skills') return m.settings_skills_title()
  return m.settings_updates_title()
}

function settingsPageDescription(page: SettingsRoute): string {
  if (page === 'language') return m.settings_language_description()
  if (page === 'appearance') return m.settings_appearance_description()
  if (page === 'skills') return m.settings_skills_description()
  return m.settings_updates_description()
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

function FontCard({
  name,
  active,
  onClick
}: {
  name: AppFontName
  active: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="rounded-lg border bg-fd-background p-4 text-start transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/30 data-[active=true]:border-fd-primary data-[active=true]:bg-fd-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{fontLabel(name)}</div>
          <p className="mt-1 text-xs text-fd-muted-foreground">{fontDescription(name)}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-fd-card px-2 py-0.5 text-xs text-fd-muted-foreground">
          {active ? <Check className="size-3" /> : null}
          {active ? m.settings_current() : m.settings_select()}
        </span>
      </div>
      <p className={fontPreviewClass(name)}>{m.settings_font_preview()}</p>
    </button>
  )
}

function languageLabel(language: AppLanguage): string {
  if (language === 'zh-CN') return m.settings_language_chinese()
  if (language === 'en-US') return m.settings_language_english()
  return m.settings_language_system()
}

function fontLabel(name: AppFontName): string {
  if (name === 'bricolage') return m.font_bricolage_label()
  if (name === 'serif') return m.font_serif_label()
  if (name === 'mono') return m.font_mono_label()
  return m.font_system_label()
}

function fontDescription(name: AppFontName): string {
  if (name === 'bricolage') return m.font_bricolage_description()
  if (name === 'serif') return m.font_serif_description()
  if (name === 'mono') return m.font_mono_description()
  return m.font_system_description()
}

function fontPreviewClass(name: AppFontName): string {
  const base = 'mt-4 rounded-md border bg-fd-card px-3 py-2 text-lg'
  if (name === 'bricolage') return `${base} font-["Bricolage_Grotesque"]`
  if (name === 'serif') return `${base} font-serif`
  if (name === 'mono') return `${base} font-mono text-base`
  return base
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
