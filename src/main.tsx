import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <StrictMode>
      <Toaster richColors />
      <App />
    </StrictMode>,
  </ThemeProvider>
)
