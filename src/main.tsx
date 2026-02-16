import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ServicesProvider } from './services'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesProvider>
      <App />
    </ServicesProvider>
  </React.StrictMode>,
)
