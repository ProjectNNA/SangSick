import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole } from '../lib/roleUtils'

export default function ProfileHeader({ user, onLogout }) {
  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0]
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'))
    }
    return false
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Fetch user role on component mount
  useEffect(() => {
    async function fetchUserRole() {
      if (user?.id) {
        const role = await getUserRole(user.id)
        setUserRole(role)
      }
    }
    fetchUserRole()
  }, [user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left: Logo and App Name */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <span className="w-10 h-10 block">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#6366F1"/>
                <g>
                  <ellipse cx="20" cy="16" rx="8" ry="9" fill="#FDE047"/>
                  <rect x="16" y="25" width="8" height="4" rx="2" fill="#FDE047"/>
                  <rect x="18" y="29" width="4" height="3" rx="1.5" fill="#FDE047"/>
                  <path d="M15 16l3 3 5-5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </span>
            <span className="text-2xl font-bold text-indigo-700 dark:text-yellow-300 tracking-tight select-none">
              상식퀴즈
            </span>
          </button>
        </div>
        {/* Right: All icons and user area */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light mode toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
          {/* User area: avatar + name, dropdown menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <div className="w-10 h-10 bg-indigo-600 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-semibold text-lg">
                  {nickname?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-yellow-200">
                {nickname}님
              </span>
              {/* Down arrow icon */}
              <svg className={`w-4 h-4 ml-1 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2 animate-fade-in">
                {userRole === 'admin' && (
                  <button
                    className="w-full text-left px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                  >
                    관리
                  </button>
                )}
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                >
                  프로필
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 