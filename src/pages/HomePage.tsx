import { useState } from 'react'
import QuizGame from '../components/QuizGame'
import type { User, QuizResults } from '../types'

interface HomePageProps {
  user: User;
}

export default function HomePage({ user }: HomePageProps) {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'finished'
  const [score, setScore] = useState(0)

  const handleStartQuiz = () => {
    setGameState('playing')
    setScore(0)
  }

  const handleQuizComplete = (quizResults: QuizResults | number) => {
    // Handle both old format (just score) and new format (object with details)
    if (typeof quizResults === 'number') {
      setScore(quizResults)
    } else {
      setScore(quizResults.score)
    }
    setGameState('finished')
  }

  const handleBackToMenu = () => {
    setGameState('menu')
    setScore(0)
  }

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0]

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      {gameState === 'menu' && (
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              안녕하세요, {nickname}님! 👋
            </h1>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
              오늘도 새로운 지식에 도전해보세요! 다양한 분야의 상식 문제가 기다리고 있습니다.
            </p>
            <button
              onClick={handleStartQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              퀴즈 시작하기 🚀
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 md:p-6 text-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-lg md:text-2xl">🎯</span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                오늘의 도전
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                새로운 10문제로 실력을 테스트해보세요
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 md:p-6 text-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-lg md:text-2xl">📈</span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                내 기록
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                프로필에서 상세한 통계를 확인하세요
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 md:p-6 text-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-lg md:text-2xl">⏱️</span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                빠른 도전
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                각 문제당 10초, 집중력을 발휘하세요
              </p>
            </div>
          </div>

          {/* Quiz Info & Tips */}
          <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
            {/* Quiz Rules */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center">
                <span className="text-lg md:text-2xl mr-2 md:mr-3">📋</span>
                퀴즈 규칙
              </h2>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-medium">1</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    총 50문제 중 10문제가 랜덤으로 선택됩니다
                  </p>
                </div>
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-medium">2</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    각 문제당 10초의 제한 시간이 있습니다
                  </p>
                </div>
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-medium">3</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    정답 시 난이도별로 다른 점수를 획득합니다
                  </p>
                </div>
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-medium">4</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    시간 초과 시 자동으로 다음 문제로 넘어갑니다
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center">
                <span className="text-lg md:text-2xl mr-2 md:mr-3">📚</span>
                문제 분야
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">🔬</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">과학</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">🏛️</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">역사</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">🌍</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">지리</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">📖</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">문학</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">⚽</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">스포츠</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-lg md:text-2xl">🎭</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">예술</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 text-center">
                  💡 <strong>팁:</strong> 다양한 분야의 문제가 섞여 나오니 폭넓은 지식이 필요해요!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <QuizGame onComplete={handleQuizComplete} user={user} />
      )}

      {gameState === 'finished' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              퀴즈 완료! 🎉
            </h2>
            <div className="text-4xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 md:mb-4">
              {score}점
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
              수고하셨습니다! 다시 도전해보세요.
            </p>
            
            <div className="space-y-3 md:space-y-4">
              <button
                onClick={handleStartQuiz}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
              >
                다시 도전하기 🔄
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
              >
                메인 메뉴로
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
} 