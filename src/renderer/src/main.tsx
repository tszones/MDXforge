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
