import { ScriptOnce } from '@tanstack/react-router'
import * as React from 'react'
import { websiteConfig } from '@/config/website'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  systemTheme?: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'dark',
  systemTheme: undefined
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

const defaultTheme = websiteConfig.ui.mode.defaultMode
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'${defaultTheme}';var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=t==='system'?s:t;document.documentElement.classList.add(r)}catch(e){document.documentElement.classList.add('${defaultTheme}')}})();`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    return (localStorage.getItem('theme') as Theme | null) || defaultTheme
  })
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark' | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [isMounted, setIsMounted] = React.useState(false)

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const setTheme = React.useCallback((newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  React.useEffect(() => {
    setIsMounted(true)
    if (!resolvedTheme) return
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme: isMounted && resolvedTheme ? resolvedTheme : systemTheme || 'dark',
      systemTheme: isMounted ? systemTheme : undefined
    }),
    [theme, setTheme, resolvedTheme, systemTheme, isMounted]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      <ScriptOnce>{themeScript}</ScriptOnce>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeProviderContext)
}
