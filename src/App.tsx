import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { getUserRole } from './lib/roleUtils'
import { QueryProvider } from './components/QueryClientProvider'
import WelcomePage from './components/WelcomePage'
import LoginModal from './components/LoginModal'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import StatsPage from './pages/StatsPage'
import AdminPage from './pages/AdminPage'
import type { User } from './types'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user')
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  // Fetch user role when user changes
  useEffect(() => {
    async function fetchUserRole() {
      if (user?.id) {
        const role = await getUserRole(user.id)
        setUserRole((role as 'admin' | 'user') || 'user')
      } else {
        setUserRole('user')
      }
    }
    fetchUserRole()
  }, [user?.id])

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
    <QueryProvider>
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
            <Layout user={user} onLogout={handleLogout}>
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
            </Layout>
          )}
        </div>
      </Router>
    </QueryProvider>
  )
}

export default App
