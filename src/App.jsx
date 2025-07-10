import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { getUserRole } from './lib/roleUtils'
import WelcomePage from './components/WelcomePage'
import LoginModal from './components/LoginModal'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('user')
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user role when user changes
  useEffect(() => {
    async function fetchUserRole() {
      if (user?.id) {
        const role = await getUserRole(user.id)
        setUserRole(role)
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
  const ProtectedRoute = ({ children, adminOnly = false }) => {
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
  )
}

export default App
