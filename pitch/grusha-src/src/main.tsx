import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { watchTypography } from './lib/typo'

const root = document.getElementById('root')!
watchTypography(root)

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
