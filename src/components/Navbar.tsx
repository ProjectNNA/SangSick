import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../lib/hooks'
import { calculateUserLevel } from '../lib/quizTracking'
import { useUserRole, useQuizStats, invalidateQuizStatsCache } from '../lib/hooks'
import Avatar from './Avatar'
import type { User } from '../types'

interface NavbarProps {
  user?: User | null
  onLoginClick?: () => void
  onLogout?: () => void
}

export default function Navbar({ user, onLoginClick, onLogout }: NavbarProps) {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // Use optimized hooks to prevent duplicate queries
  const { userRole } = useUserRole(user || null)
  const { quizStats: engagementStats } = useQuizStats(user || null)

  // Force refresh stats when dropdown is opened
  const handleDropdownToggle = () => {
    if (!showDropdown && user?.id) {
      // Invalidate cache to force fresh data when opening dropdown
      invalidateQuizStatsCache(user.id)
    }
    setShowDropdown(!showDropdown)
  }

  // Handle clicks outside menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Calculate user level and progress
  const userLevel = engagementStats?.engagement_stats?.total_points
    ? calculateUserLevel(engagementStats.engagement_stats.total_points)
    : 1

  const currentStreak = engagementStats?.engagement_stats?.current_streak || 0
  const totalPoints = engagementStats?.engagement_stats?.total_points || 0
  const overallAccuracy = engagementStats?.basic_stats?.overall_accuracy || 0

  // Navigation handlers
  const handleNavigateToProfile = () => {
    navigate('/profile')
    setShowDropdown(false)
  }

  const handleNavigateToStats = () => {
    navigate('/stats')
    setShowDropdown(false)
  }

  const handleNavigateToAdmin = () => {
    navigate('/admin')
    setShowDropdown(false)
  }

  const handleNavigateToHome = () => {
    if (user) {
      navigate('/')
    } else {
      window.location.reload()
    }
  }

  return (
    <header className={`${user ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md' : 'bg-white dark:bg-gray-900'} shadow-sm border-b border-gray-200 dark:border-gray-700 ${user ? 'sticky top-0 z-50' : ''}`}>
      <div className={`${user ? 'max-w-7xl' : 'container'} mx-auto px-4 py-2 flex justify-between items-center`}>
        {/* Left: Logo and App Name */}
        <button 
          onClick={handleNavigateToHome}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
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
          <div>
            <h1 className={`font-bold text-indigo-700 dark:text-yellow-300 tracking-tight ${user ? 'text-xl' : 'text-2xl'} select-none`}>
              {user ? 'SangSick' : '상식퀴즈'}
            </h1>
            {user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                상식 퀴즈 플랫폼
              </p>
            )}
          </div>
        </button>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* User Level */}
              <div className="font-bold text-indigo-600 dark:text-indigo-400">
                Lv.{userLevel}
              </div>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* User Avatar */}
                  <Avatar 
                    avatarUrl={user?.user_metadata?.avatar_url}
                    fallback={user?.user_metadata?.nickname || user?.email?.split('@')[0] || 'User'}
                    size="sm"
                  />
                  
                  {/* User Info (hidden on mobile) */}
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.user_metadata?.nickname || '사용자'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {userRole === null ? '로딩 중...' : userRole === 'admin' ? '관리자' : '일반 사용자'}
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 sm:right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-w-[calc(100vw-2rem)]">
                    {/* User Profile Section */}
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar 
                          avatarUrl={user?.user_metadata?.avatar_url}
                          fallback={user?.user_metadata?.nickname || user?.email?.split('@')[0] || 'User'}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {user?.user_metadata?.nickname || '사용자'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">
                            {userRole === null ? '로딩 중...' : userRole === 'admin' ? '관리자' : '일반 사용자'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    {engagementStats && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          <div className="text-center p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div className="font-bold text-indigo-600 dark:text-indigo-400">
                              {totalPoints}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">포인트</div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {overallAccuracy}%
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">정확도</div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              🔥 {currentStreak}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">연속</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleNavigateToProfile}
                        className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        프로필 관리
                      </button>
                      
                      <button
                        onClick={handleNavigateToStats}
                        className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        학습 통계
                      </button>

                      {userRole === 'admin' && (
                        <button
                          onClick={handleNavigateToAdmin}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          관리자 패널
                        </button>
                      )}

                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      
                      {/* Dark Mode Toggle */}
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        {isDarkMode ? (
                          <svg className="w-4 h-4 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                          </svg>
                        )}
                        {isDarkMode ? '라이트 모드' : '다크 모드'}
                      </button>
                      
                      <button
                        onClick={onLogout}
                        className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 