import { useState } from 'react'
import { formatResponseTime } from '../lib/quizTracking'

export default function TimeInsights({ timeData, engagementStats }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('day') // 'day', 'week', 'month'
  
  if (!timeData && !engagementStats) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          ⏰ 시간 분석 리포트
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏱️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            시간 데이터가 부족합니다
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            더 많은 퀴즈를 완료하시면 시간 기반 분석이 표시됩니다
          </p>
        </div>
      </div>
    )
  }

  // Calculate time-based metrics
  const averageResponseTime = timeData?.average_response_time_ms || 0
  const fastestResponseTime = timeData?.fastest_response_time_ms || 0
  const slowestResponseTime = timeData?.slowest_response_time_ms || 0
  const bestPerformanceHour = timeData?.best_performance_hour || 0
  const totalStudyTime = Math.round((engagementStats?.total_study_time_minutes || 0) / 60 * 10) / 10
  const averageSessionDuration = timeData?.average_session_duration_minutes || 0

  // Response time categories
  const getResponseTimeCategory = (timeMs) => {
    if (timeMs < 3000) return { label: '매우 빠름', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '🚀' }
    if (timeMs < 8000) return { label: '빠름', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '⚡' }
    if (timeMs < 15000) return { label: '보통', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: '🤔' }
    if (timeMs < 30000) return { label: '느림', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: '🐌' }
    return { label: '매우 느림', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '🐢' }
  }

  // Time of day analysis
  const getTimeOfDayAnalysis = (hour) => {
    if (hour >= 6 && hour < 12) return { period: '오전', emoji: '🌅', color: 'from-yellow-400 to-orange-500' }
    if (hour >= 12 && hour < 18) return { period: '오후', emoji: '☀️', color: 'from-orange-400 to-red-500' }
    if (hour >= 18 && hour < 22) return { period: '저녁', emoji: '🌆', color: 'from-purple-400 to-pink-500' }
    return { period: '밤', emoji: '🌙', color: 'from-blue-400 to-purple-500' }
  }

  const responseTimeCategory = getResponseTimeCategory(averageResponseTime)
  const timeOfDayInfo = getTimeOfDayAnalysis(bestPerformanceHour)

  // Study efficiency calculation
  const studyEfficiency = totalStudyTime > 0 && engagementStats?.total_questions_answered
    ? Math.round((engagementStats.total_questions_answered / (totalStudyTime * 60)) * 100) / 100
    : 0

  // Performance insights
  const getPerformanceInsights = () => {
    const insights = []
    
    if (averageResponseTime < 5000) {
      insights.push({
        type: 'positive',
        icon: '🚀',
        title: '빠른 응답 속도',
        message: '평균 응답 시간이 매우 빠릅니다! 빠른 사고력을 보여주고 있어요.'
      })
    } else if (averageResponseTime > 20000) {
      insights.push({
        type: 'improvement',
        icon: '💪',
        title: '사고 시간 활용',
        message: '충분한 사고 시간을 활용하고 있습니다. 정확도를 높이는 데 도움이 됩니다.'
      })
    }

    if (bestPerformanceHour >= 9 && bestPerformanceHour <= 11) {
      insights.push({
        type: 'tip',
        icon: '🧠',
        title: '최적의 학습 시간',
        message: '오전 시간대에 집중력이 가장 높습니다. 이 시간을 최대한 활용해보세요!'
      })
    }

    if (studyEfficiency > 1) {
      insights.push({
        type: 'positive',
        icon: '⚡',
        title: '높은 학습 효율',
        message: `분당 ${studyEfficiency}문제를 해결하는 효율적인 학습 패턴을 보여줍니다.`
      })
    }

    return insights
  }

  const insights = getPerformanceInsights()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0 flex items-center">
          ⏰ 시간 분석 리포트
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">분석 기간:</span>
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">일별</option>
            <option value="week">주별</option>
            <option value="month">월별</option>
          </select>
        </div>
      </div>

      {/* Quick Response Time Overview */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Response Time */}
          <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="text-4xl mb-3">{responseTimeCategory.icon}</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {formatResponseTime(averageResponseTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              평균 응답 시간
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${responseTimeCategory.bg} ${responseTimeCategory.color}`}>
              {responseTimeCategory.label}
            </div>
          </div>

          {/* Best Performance Time */}
          <div className={`text-center p-6 bg-gradient-to-br ${timeOfDayInfo.color} rounded-xl text-white`}>
            <div className="text-4xl mb-3">{timeOfDayInfo.emoji}</div>
            <div className="text-3xl font-bold mb-2">
              {bestPerformanceHour}시
            </div>
            <div className="text-sm mb-2 text-white/90">
              최고 성과 시간
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {timeOfDayInfo.period} 시간대
            </div>
          </div>

          {/* Study Efficiency */}
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {studyEfficiency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              분당 문제 해결 수
            </div>
            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
              학습 효율성
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Response Time Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            ⚡ 응답 시간 분석
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">가장 빠른 응답:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatResponseTime(fastestResponseTime)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">평균 응답 시간:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatResponseTime(averageResponseTime)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">가장 느린 응답:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {formatResponseTime(slowestResponseTime)}
              </span>
            </div>

            {/* Response Time Range Visualization */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">응답 시간 범위</div>
              <div className="relative h-8 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 dark:from-green-800 dark:via-yellow-800 dark:to-red-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-400"
                  style={{ width: `${(fastestResponseTime / (slowestResponseTime || 1)) * 100}%` }}
                ></div>
                <div 
                  className="absolute top-0 bg-blue-500 dark:bg-blue-400 h-full w-1 rounded-full"
                  style={{ left: `${(averageResponseTime / (slowestResponseTime || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>빠름</span>
                <span>평균</span>
                <span>느림</span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Session Analysis */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            📚 학습 세션 분석
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">총 학습 시간:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {totalStudyTime}시간
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">평균 세션 길이:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {averageSessionDuration}분
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">총 문제 수:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {engagementStats?.total_questions_answered || 0}문제
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">학습 효율:</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {studyEfficiency}/분
              </span>
            </div>

            {/* Study Progress Bar */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">학습 집중도</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(studyEfficiency * 20, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {studyEfficiency > 2 ? '매우 높음' : studyEfficiency > 1 ? '높음' : studyEfficiency > 0.5 ? '보통' : '낮음'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 시간 기반 인사이트
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl border-l-4 ${
                  insight.type === 'positive' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                    : insight.type === 'improvement'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-based Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          🎯 시간 최적화 제안
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏰</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {bestPerformanceHour}시경에 가장 좋은 성과를 보였습니다
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">🚀</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {averageResponseTime < 10000 
                  ? '적절한 속도로 문제를 해결하고 있습니다'
                  : '충분한 시간을 들여 정확도를 높이고 있습니다'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📈</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {studyEfficiency > 1 
                  ? '효율적인 학습 패턴을 유지하고 있습니다'
                  : '더 집중적인 학습을 통해 효율성을 높일 수 있습니다'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">💪</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {averageSessionDuration > 15 
                  ? '충분한 학습 시간을 확보하고 있습니다'
                  : '학습 세션 시간을 조금 더 늘려보세요'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 