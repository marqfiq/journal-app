import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import AnimatedBackground from './components/AnimatedBackground'
import LoadingSpinner from './components/LoadingSpinner'
import Home from './pages/Home'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import Entry from './pages/Entry'
import Settings from './pages/Settings'

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route
        path="/entry/:id"
        element={
          <ProtectedRoute>
            <Entry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white relative">
        <AnimatedBackground />
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App

