import { useState } from 'react'

export default function WelcomePage({ onLoginClick }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'))
    }
    return false
  })

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left: Logo and App Name */}
          <div className="flex items-center space-x-3">
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
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
          </div>

          {/* Right: Login Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              로그인
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              상식 퀴즈에 오신 것을 환영합니다! 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              다양한 분야의 상식 문제를 풀어보며 지식을 넓혀보세요. 
              과학, 역사, 지리, 문학, 스포츠 등 다양한 주제의 퀴즈를 준비했습니다.
            </p>
            <button
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              지금 시작하기 🚀
            </button>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                다양한 분야
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                과학, 역사, 지리, 문학, 스포츠 등 다양한 분야의 상식 문제를 제공합니다.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                랜덤 출제
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                매번 다른 문제가 출제되어 매번 새로운 도전을 경험할 수 있습니다.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                시간 제한
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                각 문제당 10초의 제한 시간으로 긴장감 있는 퀴즈를 즐겨보세요.
              </p>
            </div>
          </div>

          {/* How to Play Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              어떻게 플레이하나요?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📋 퀴즈 규칙
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    총 50문제 중 10문제가 랜덤으로 선택됩니다
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    각 문제당 10초의 제한 시간이 있습니다
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    정답 시 난이도별로 점수를 획득합니다
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    시간 초과 시 자동으로 다음 문제로 넘어갑니다
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🎮 플레이 방법
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">1.</span>
                    로그인하여 계정을 만드세요
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">2.</span>
                    퀴즈 시작 버튼을 클릭하세요
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">3.</span>
                    문제를 읽고 정답을 선택하세요
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">4.</span>
                    최종 점수를 확인하고 다시 도전하세요
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 