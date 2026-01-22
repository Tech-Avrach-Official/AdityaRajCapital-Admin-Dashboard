import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Providers from './global_redux/provider/provider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
