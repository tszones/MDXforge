import '@fontsource/bricolage-grotesque/latin-400.css'
import '@fontsource/bricolage-grotesque/latin-500.css'
import '@fontsource/bricolage-grotesque/latin-600.css'
import '@fontsource/bricolage-grotesque/latin-700.css'
import './assets/main.css'
import './bootstrap'

import { HotkeysProvider } from '@tanstack/react-hotkeys'
import { RootProvider } from 'fumadocs-ui/provider/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Toaster } from 'sonner'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <HotkeysProvider
        defaultOptions={{
          hotkey: {
            conflictBehavior: 'warn',
            eventType: 'keydown',
            preventDefault: true,
            requireReset: true,
            stopPropagation: true
          }
        }}
      >
        <RootProvider search={{ enabled: false }}>
          <App />
          <Toaster richColors position="bottom-right" />
        </RootProvider>
      </HotkeysProvider>
    </HashRouter>
  </StrictMode>
)
