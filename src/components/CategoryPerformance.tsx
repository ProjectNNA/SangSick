import { useState } from 'react'
import { getCategoryEmoji } from '../lib/quizTracking'
import type { CategoryPerformanceProps } from '../types'
// ✨ Import auto-generated types for clean syntax
import { Database } from '../types/database.types'

// ✨ Clean auto-generated type syntax (exactly what you wanted!)
type CategoryPerformanceRow = Database['public']['Tables']['category_performance']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']
type UserEngagementRow = Database['public']['Tables']['user_engagement_stats']['Row']

export default function CategoryPerformance({ categories, onCategoryClick }: CategoryPerformanceProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'accuracy' | 'attempts' | 'points'>('accuracy')

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          📚 분야별 성과 분석
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            아직 분야별 데이터가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            퀴즈를 더 풀어보시면 분야별 상세 분석이 표시됩니다
          </p>
        </div>
      </div>
    )
  }

  // Sort categories based on selected criteria
  const sortedCategories = [...categories].sort((a, b) => {
    switch (sortBy) {
      case 'accuracy':
        return (b.accuracy_percentage || 0) - (a.accuracy_percentage || 0)
      case 'attempts':
        return (b.total_attempts || 0) - (a.total_attempts || 0)
      case 'points':
        return (b.total_points || 0) - (a.total_points || 0)
      default:
        return 0
    }
  })

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: '마스터', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: '👑' }
    if (accuracy >= 80) return { level: '우수', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '🌟' }
    if (accuracy >= 70) return { level: '양호', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '📈' }
    if (accuracy >= 60) return { level: '보통', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: '⚡' }
    return { level: '개선 필요', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '💪' }
  }

  const getDifficultyStars = (difficulty: number) => {
    const rounded = Math.round(difficulty || 0)
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
  }

  const toggleExpanded = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      {/* Header with Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0 flex items-center">
          📚 분야별 성과 분석
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">정렬:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'accuracy' | 'attempts' | 'points')}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="accuracy">정답률순</option>
            <option value="attempts">시도횟수순</option>
            <option value="points">획득점수순</option>
          </select>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCategories.map((category, index) => {
          const performance = getPerformanceLevel(category.accuracy_percentage || 0)
          const isExpanded = expandedCategory === category.category
          
          return (
            <div 
              key={category.category}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              {/* Main Category Card */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{getCategoryEmoji(category.category)}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${performance.bg} ${performance.color}`}>
                        <span className="mr-1">{performance.icon}</span>
                        {performance.level}
                      </div>
                    </div>
                  </div>
                  
                  {/* Accuracy Circle */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(category.accuracy_percentage || 0) * 1.76} 176`}
                        className="text-indigo-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.accuracy_percentage || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {category.total_attempts || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      총 시도
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {category.correct_attempts || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      정답
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${category.accuracy_percentage || 0}%` }}
                  >
                    {(category.accuracy_percentage || 0) > 20 && (
                      <span className="text-white text-xs font-bold">
                        {category.accuracy_percentage || 0}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle Detailed View Button */}
                <button
                  onClick={() => toggleExpanded(category.category)}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <span>{isExpanded ? '간단히 보기' : '자세히 보기'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4 pt-4">
                    {/* Detailed Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {category.total_points || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          획득 점수
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                          {getDifficultyStars(category.average_difficulty)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          평균 난이도
                        </div>
                      </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        성과 분석
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">평균 점수/문제:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.total_attempts > 0 
                              ? Math.round((category.total_points || 0) / category.total_attempts)
                              : 0}점
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">최근 활동:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.last_attempt 
                              ? new Date(category.last_attempt).toLocaleDateString('ko-KR')
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">연속 정답 기록:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.best_streak || 0}문제
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <span className="text-lg mr-2">💡</span>
                        개선 제안
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {(category.accuracy_percentage || 0) >= 90
                          ? `${category.category} 분야를 완벽하게 마스터했습니다! 다른 분야에도 도전해보세요.`
                          : (category.accuracy_percentage || 0) >= 70
                          ? `${category.category} 분야에서 좋은 성과를 보이고 있습니다. 조금 더 연습하면 마스터 레벨에 도달할 수 있어요!`
                          : `${category.category} 분야를 더 연습해보세요. 다양한 난이도의 문제를 풀어보시는 것을 추천합니다.`}
                      </p>
                    </div>

                    {/* Action Button */}
                    {onCategoryClick && (
                      <button
                        onClick={() => onCategoryClick(category.category)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                      >
                        {category.category} 분야 퀴즈 풀기
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 전체 분야 요약
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              도전한 분야
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.filter(cat => (cat.accuracy_percentage || 0) >= 90).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              마스터한 분야
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {categories.reduce((sum, cat) => sum + (cat.total_points || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              총 획득 점수
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(categories.reduce((sum, cat) => sum + (cat.accuracy_percentage || 0), 0) / categories.length) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              평균 정답률
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 