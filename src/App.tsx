import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserRole } from './lib/hooks'
import WelcomePage from './components/WelcomePage'
import LoginModal from './components/LoginModal'
import ProfileHeader from './components/ProfileHeader'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import StatsPage from './pages/StatsPage'
import AdminPage from './pages/AdminPage'
import type { User } from './types'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Use optimized hook instead of direct API call
  const { userRole } = useUserRole(user)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User | null ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user as User | null ?? null)
      // Log the event for debugging
      if (event === 'USER_UPDATED') {
        console.log('User metadata updated:', session?.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleLoginClose = () => {
    setShowLoginModal(false)
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
    if (!user) {
      return <Navigate to="/" replace />
    }
    
    // Wait for user role to load before checking admin access
    if (adminOnly && userRole === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-xl">권한 확인 중...</div>
        </div>
      )
    }
    
    if (adminOnly && userRole !== 'admin') {
      return <Navigate to="/" replace />
    }
    
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!user ? (
          <>
            <WelcomePage onLoginClick={handleLoginClick} />
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={handleLoginClose} 
              onLoginSuccess={handleLoginSuccess}
            />
          </>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <ProfileHeader user={user} onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stats" 
                element={
                  <ProtectedRoute>
                    <StatsPage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App
