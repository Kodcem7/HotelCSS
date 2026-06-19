import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'material-symbols/outlined.css'  // self-hosted icon font (works offline / behind captive portal)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
