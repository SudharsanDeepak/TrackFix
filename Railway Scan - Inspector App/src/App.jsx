import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ScanPage from './pages/ScanPage'
import InspectionsPage from './pages/InspectionsPage'
import NewInspectionPage from './pages/NewInspectionPage'
import InspectionDetailPage from './pages/InspectionDetailPage'
import ProfilePage from './pages/ProfilePage'
import AuthCallbackPage from './pages/AuthCallbackPage'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Handles Capacitor deeplinks: railtrack://auth/callback?accessToken=...
const DeepLinkHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    let cleanup = () => {}

    const setupDeepLink = async () => {
      try {
        const { App } = await import('@capacitor/app')
        const handler = await App.addListener('appUrlOpen', ({ url }) => {
          // e.g. railtrack://auth/callback?accessToken=xxx&refreshToken=yyy
          const parsed = new URL(url)
          const path = parsed.pathname  // "/callback"
          const search = parsed.search  // "?accessToken=..."
          navigate(`/auth${path}${search}`, { replace: true })
        })
        cleanup = () => handler.remove()
      } catch {
        // Not running in Capacitor (web dev mode) — no-op
      }
    }

    setupDeepLink()
    return () => cleanup()
  }, [navigate])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
      <DeepLinkHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/scan" element={<PrivateRoute><ScanPage /></PrivateRoute>} />
        <Route path="/inspections" element={<PrivateRoute><InspectionsPage /></PrivateRoute>} />
        <Route path="/inspections/new" element={<PrivateRoute><NewInspectionPage /></PrivateRoute>} />
        <Route path="/inspections/:id" element={<PrivateRoute><InspectionDetailPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
