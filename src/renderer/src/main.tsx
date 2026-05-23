import '@fontsource/bricolage-grotesque/latin-400.css'
import '@fontsource/bricolage-grotesque/latin-500.css'
import '@fontsource/bricolage-grotesque/latin-600.css'
import '@fontsource/bricolage-grotesque/latin-700.css'
import './assets/main.css'

import { RootProvider } from 'fumadocs-ui/provider/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <RootProvider search={{ enabled: false }}>
        <App />
      </RootProvider>
    </HashRouter>
  </StrictMode>
)
