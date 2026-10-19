import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import '@/lib/i18n/i18n'
import { queryClient } from '@/services/queryClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm font-medium',
          style: { borderRadius: '12px', whiteSpace: 'pre-line', maxWidth: 480 },
          success: { iconTheme: { primary: '#374037', secondary: '#F4F2E4' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
