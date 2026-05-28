import { ArrowLeft, Settings } from 'lucide-react'
import { NavLink } from 'react-router'
import type { AppFontName } from '../lib/font'
import type { ColorMode, FumadocsThemeName } from '../lib/theme'
import { m } from '../paraglide/messages'
import type { AppLanguage, AskAiButtonAction } from '../types'
import { AppearanceSettingsPage } from './settings/AppearanceSettingsPage'
import { AskAiSettingsPage } from './settings/AskAiSettingsPage'
import { DocumentsSettingsPage } from './settings/DocumentsSettingsPage'
import { LanguageSettingsPage } from './settings/LanguageSettingsPage'
import { SkillsSettingsPage } from './settings/SkillsSettingsPage'
import { UpdateSettingsCard } from './UpdateSettingsCard'

export type SettingsRoute = 'language' | 'appearance' | 'documents' | 'updates' | 'skills' | 'ask-ai'

interface SettingsPageProps {
  page: SettingsRoute
  theme: FumadocsThemeName
  mode: ColorMode
  language: AppLanguage
  font: AppFontName
  viewableDocumentExtensions: string[]
  askAiButtonAction: AskAiButtonAction
  onThemeChange: (theme: FumadocsThemeName) => void
  onModeChange: (mode: ColorMode) => void
  onLanguageChange: (language: AppLanguage) => void
  onFontChange: (font: AppFontName) => void
  onViewableDocumentExtensionsChange: (extensions: string[]) => void
  onAskAiButtonActionChange: (action: AskAiButtonAction) => void
  workspaceRoot?: string
  onBack: () => void
}

export function SettingsPage({
  page,
  theme,
  mode,
  language,
  font,
  viewableDocumentExtensions,
  askAiButtonAction,
  onThemeChange,
  onModeChange,
  onLanguageChange,
  onFontChange,
  onViewableDocumentExtensionsChange,
  onAskAiButtonActionChange,
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
            <SettingsNavLink to="/settings/documents">
              {m.settings_documents_title()}
            </SettingsNavLink>
            <SettingsNavLink to="/settings/updates">{m.settings_updates_title()}</SettingsNavLink>
            <SettingsNavLink to="/settings/skills">{m.settings_skills_title()}</SettingsNavLink>
            <SettingsNavLink to="/settings/ask-ai">{m.settings_ask_ai_title()}</SettingsNavLink>
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
          {page === 'documents' ? (
            <DocumentsSettingsPage
              extensions={viewableDocumentExtensions}
              onExtensionsChange={onViewableDocumentExtensionsChange}
            />
          ) : null}
          {page === 'skills' ? <SkillsSettingsPage workspaceRoot={workspaceRoot} /> : null}
          {page === 'ask-ai' ? (
            <AskAiSettingsPage
              action={askAiButtonAction}
              onActionChange={onAskAiButtonActionChange}
            />
          ) : null}
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

function settingsPageTitle(page: SettingsRoute): string {
  if (page === 'language') return m.settings_language_tab()
  if (page === 'appearance') return m.settings_appearance_title()
  if (page === 'documents') return m.settings_documents_title()
  if (page === 'skills') return m.settings_skills_title()
  if (page === 'ask-ai') return m.settings_ask_ai_title()
  return m.settings_updates_title()
}

function settingsPageDescription(page: SettingsRoute): string {
  if (page === 'language') return m.settings_language_description()
  if (page === 'appearance') return m.settings_appearance_description()
  if (page === 'documents') return m.settings_documents_description()
  if (page === 'skills') return m.settings_skills_description()
  if (page === 'ask-ai') return m.settings_ask_ai_description()
  return m.settings_updates_description()
}
