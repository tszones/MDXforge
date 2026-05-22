import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { RootProvider } from 'fumadocs-ui/provider/react-router'
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
