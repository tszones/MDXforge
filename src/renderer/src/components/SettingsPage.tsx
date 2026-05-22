import { ArrowLeft, Check, Moon, Palette, Settings, Sun } from 'lucide-react'
import { type ColorMode, FUMADOCS_THEMES, type FumadocsThemeName } from '../lib/theme'

const THEME_META: Record<
  FumadocsThemeName,
  { label: string; description: string; colors: [string, string, string, string] }
> = {
  neutral: {
    label: 'Neutral / 中性灰',
    description: '默认灰阶，最接近 Fumadocs 基础外观。',
    colors: ['hsl(0 0% 96%)', 'hsl(0 0% 9%)', 'hsl(0 0% 93.1%)', 'hsl(0 0% 82%)']
  },
  black: {
    label: 'Black / 纯黑',
    description: '高对比黑白，深色模式更纯粹。',
    colors: ['hsl(0 0% 98%)', 'hsl(0 0% 9%)', 'hsl(0 0% 96.1%)', 'hsl(0 0% 94.1%)']
  },
  vitepress: {
    label: 'VitePress / 蓝紫文档',
    description: '白底蓝紫主色，接近 VitePress 文档风格。',
    colors: ['hsl(0 0% 100%)', 'hsl(226 55% 45%)', 'hsl(240 6% 97%)', 'hsl(0 0% 94.1%)']
  },
  dusk: {
    label: 'Dusk / 暮色粉紫',
    description: '低饱和紫灰底，玫粉主色。',
    colors: ['hsl(250 20% 92%)', 'hsl(340 40% 48%)', 'hsl(250 40% 94%)', 'hsl(250 30% 90%)']
  },
  catppuccin: {
    label: 'Catppuccin / 奶油紫',
    description: '柔和奶油色系，紫色主色。',
    colors: ['hsl(220 23% 95%)', 'hsl(266 85% 58%)', 'hsl(220 22% 92%)', 'hsl(223 16% 83%)']
  },
  ocean: {
    label: 'Ocean / 海洋蓝',
    description: '浅蓝灰卡片与深海蓝主色。',
    colors: ['hsl(0 0% 98%)', 'hsl(210 80% 20.2%)', 'hsl(220 90% 96.1%)', 'hsl(220 50% 94.1%)']
  },
  purple: {
    label: 'Purple / 紫罗兰',
    description: '明亮紫色主题，视觉更活泼。',
    colors: ['hsl(256 100% 96%)', 'hsl(270 100% 52%)', 'hsl(270 60% 90%)', 'hsl(270 40% 88%)']
  },
  solar: {
    label: 'Solar / 纸张卡片',
    description: '更像独立纸张/卡片的阅读版式。',
    colors: ['hsl(0 0% 97%)', 'oklch(0.487 0.083 262.691)', 'hsl(0 0% 96.1%)', 'hsl(0 0% 82%)']
  },
  emerald: {
    label: 'Emerald / 翡翠绿',
    description: '清爽绿色系，适合知识库/笔记。',
    colors: ['hsl(165 45% 96%)', 'hsl(168 70% 40%)', 'hsl(168 45% 88%)', 'hsl(165 50% 90%)']
  },
  ruby: {
    label: 'Ruby / 宝石红',
    description: '红宝石主色，醒目但不刺眼。',
    colors: ['hsl(0 0% 98%)', 'hsl(348 85% 45%)', 'hsl(348 55% 92%)', 'hsl(348 70% 95%)']
  },
  aspen: {
    label: 'Aspen / 山林绿',
    description: '偏自然的黄绿色，柔和耐看。',
    colors: ['hsl(75 45% 96%)', 'hsl(80 60% 40%)', 'hsl(80 45% 88%)', 'hsl(75 50% 90%)']
  }
}

interface SettingsPageProps {
  theme: FumadocsThemeName
  mode: ColorMode
  onThemeChange: (theme: FumadocsThemeName) => void
  onModeChange: (mode: ColorMode) => void
  onBack: () => void
}

export function SettingsPage({
  theme,
  mode,
  onThemeChange,
  onModeChange,
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
            返回首页
          </button>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
            <Settings className="size-4" />
            设置
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">外观主题</h1>
          <p className="max-w-2xl text-fd-muted-foreground">
            切换 Fumadocs UI 内置主题与亮暗色模式。设置会保存在本地。
          </p>
        </header>

        <section className="grid gap-3 rounded-xl border bg-fd-card p-4 shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <Sun className="size-4" />
            颜色模式
          </div>
          <div className="flex flex-wrap gap-2">
            <ModeButton active={mode === 'light'} onClick={() => onModeChange('light')}>
              <Sun className="size-4" />
              浅色
            </ModeButton>
            <ModeButton active={mode === 'dark'} onClick={() => onModeChange('dark')}>
              <Moon className="size-4" />
              深色
            </ModeButton>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Palette className="size-4" />
            Fumadocs 主题
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

function ModeButton({
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

  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="group overflow-hidden rounded-xl border bg-fd-card text-start shadow-sm transition hover:-translate-y-0.5 hover:border-fd-primary/50 hover:shadow-md data-[active=true]:border-fd-primary data-[active=true]:ring-2 data-[active=true]:ring-fd-primary/20"
    >
      <div
        className="h-20 border-b"
        style={{
          background: `linear-gradient(135deg, ${meta.colors[0]} 0 45%, ${meta.colors[2]} 45% 70%, ${meta.colors[3]} 70% 100%)`
        }}
      >
        <div className="flex h-full items-end justify-end gap-1.5 p-3">
          {meta.colors.map((color) => (
            <span
              key={color}
              className="size-6 rounded-full border border-black/10 shadow-sm"
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-medium">{meta.label}</span>
            <code className="mt-1 block text-xs text-fd-muted-foreground">{name}</code>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-fd-muted px-2 py-0.5 text-xs text-fd-muted-foreground">
            {active ? <Check className="size-3" /> : null}
            {active ? '当前' : '选择'}
          </span>
        </div>
        <p className="mt-3 text-sm text-fd-muted-foreground">{meta.description}</p>
        <div className="mt-4 grid grid-cols-4 gap-1.5 text-[10px] text-fd-muted-foreground">
          {['背景', '主色', '次级', '强调'].map((label, index) => (
            <div key={label} className="min-w-0">
              <div
                className="mb-1 h-6 rounded-md border"
                style={{ background: meta.colors[index] }}
              />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-fd-muted-foreground">
          预览模式：{mode === 'dark' ? '深色' : '浅色'}
        </p>
      </div>
    </button>
  )
}
