import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AppRoutes from './routes'
import { config } from './config'
import './i18n'

function App() {
  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
