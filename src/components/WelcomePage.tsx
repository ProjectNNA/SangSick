import type { WelcomePageProps } from '../types'
import Navbar from './Navbar'

export default function WelcomePage({ onLoginClick }: WelcomePageProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <Navbar onLoginClick={onLoginClick} />

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