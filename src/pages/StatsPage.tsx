import { 
  formatDuration, 
  getPerformanceRating,
  calculateUserLevel,
  getLevelProgress,
  formatResponseTime
} from '../lib/quizTracking'
import { 
  useUserStatsQuery, 
  useCategoryPerformanceQuery, 
  useRecentSessionsQuery 
} from '../queries/userQueries'
import CategoryPerformance from '../components/CategoryPerformance'
import TimeInsights from '../components/TimeInsights'
import Leaderboard from '../components/Leaderboard'
import type { User, QuizSession } from '../types'

interface StatsPageProps {
  user: User;
}

export default function StatsPage({ user }: StatsPageProps) {
  // 🚀 Use TanStack Query for optimized data fetching
  const { 
    data: quizStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useUserStatsQuery(user?.id || '')

  const { 
    data: categoryPerformance = [], 
    isLoading: categoryLoading 
  } = useCategoryPerformanceQuery(user?.id || '')

  const { 
    data: recentSessions = [], 
    isLoading: sessionsLoading 
  } = useRecentSessionsQuery(user?.id || '', 10)

  // Calculate user level and progress
  const userLevel = quizStats?.engagement_stats?.total_points 
    ? calculateUserLevel(quizStats.engagement_stats.total_points)
    : 1
  
  const levelProgress = quizStats?.engagement_stats?.total_points
    ? getLevelProgress(quizStats.engagement_stats.total_points)
    : { level: 1, progress: 0, needed: 100, percentage: 0 }

  // Show error state if any critical data fails to load
  if (statsError) {
      return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8">
            <div className="text-center py-6 md:py-8">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">⚠️</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                데이터를 불러올 수 없습니다
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                통계 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  if (statsLoading || categoryLoading || sessionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="text-center py-8">
              <div className="text-gray-600 dark:text-gray-300">통계를 불러오는 중...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quizStats || !quizStats.basic_stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 퀴즈 통계
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              상세한 학습 분석과 성과를 확인하세요
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                첫 퀴즈에 도전해보세요!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                퀴즈를 완료하면 상세한 통계와 분석이 여기에 표시됩니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium">분야별 성과 분석</div>
                  <div>과학, 역사, 지리 등</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="font-medium">연속 기록 및 레벨</div>
                  <div>스트릭과 성취도</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium">상세 학습 분석</div>
                  <div>응답 시간, 난이도별 성과</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
            📊 퀴즈 통계
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            상세한 학습 분석과 성과를 확인하세요
          </p>
        </div>

        <div className="space-y-4 md:space-y-8">
          {/* Overview Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white">
                🎯 종합 통계
              </h2>
              <div className="flex items-center space-x-2 md:space-x-4">
                {quizStats.engagement_stats?.current_streak > 0 && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold">
                    🔥 {quizStats.engagement_stats.current_streak}일 연속
                  </div>
                )}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold">
                  LV.{userLevel}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <div className="text-center p-3 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quizStats.basic_stats.completed_sessions || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-2">
                  총 완료 세션
                </div>
              </div>
              
              <div className="text-center p-3 md:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                  {quizStats.basic_stats.overall_accuracy || 0}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-2">
                  전체 정답률
                </div>
              </div>
              
              <div className="text-center p-3 md:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {quizStats.basic_stats.highest_score || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-2">
                  최고 점수
                </div>
              </div>
              
              <div className="text-center p-3 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {quizStats.engagement_stats?.total_points || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  총 획득 점수
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            {quizStats.engagement_stats && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📈 학습 지표
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {quizStats.engagement_stats.longest_streak || 0}일
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      최장 연속 기록
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {Math.round((quizStats.engagement_stats.total_study_time_minutes || 0) / 60 * 10) / 10}시간
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      총 학습 시간
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {quizStats.time_performance?.average_response_time_ms 
                        ? formatResponseTime(quizStats.time_performance.average_response_time_ms)
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      평균 응답 시간
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {quizStats.time_performance?.best_performance_hour 
                        ? `${quizStats.time_performance.best_performance_hour}시`
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      최고 성과 시간대
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Level Progress */}
            {quizStats.engagement_stats?.total_points > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎖️ 레벨 진행도
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 dark:text-gray-300">
                      Level {userLevel} → Level {userLevel + 1}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {levelProgress.progress}/{levelProgress.needed} 점
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${levelProgress.percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {levelProgress.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Category Performance */}
          <CategoryPerformance 
            categories={categoryPerformance}
            onCategoryClick={(category: string) => {
              // Could implement category-specific quiz filtering here
              console.log('Category clicked:', category)
            }}
          />

          {/* Time-Based Analytics */}
          <TimeInsights 
            timeData={quizStats.time_performance}
            engagementStats={quizStats.engagement_stats}
          />

          {/* Competitive Leaderboard */}
          <Leaderboard currentUser={user} />

          {/* Achievements & Milestones */}
          {quizStats.achievements && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                🏆 성취 및 기록
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {quizStats.achievements.perfect_sessions || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    완벽한 세션
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    모든 문제를 정답으로 맞춘 횟수
                  </div>
                </div>
                
                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-6xl mb-4">🎓</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {quizStats.achievements.questions_mastered || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    마스터한 분야
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    90% 이상 정답률을 달성한 분야
                  </div>
                </div>
                
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-6xl mb-4">⭐</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {quizStats.engagement_stats?.longest_streak || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    최장 연속 기록
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    연속으로 퀴즈를 푼 최대 일수
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Sessions History */}
          {recentSessions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                📈 최근 퀴즈 기록
              </h2>
              <div className="space-y-4">
                {recentSessions.map((session: QuizSession) => {
                  const performance = getPerformanceRating(session.score)
                  const accuracy = Math.round((session.correct_answers / session.total_questions) * 100)
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{performance.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {session.score}점 ({accuracy}% 정답)
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(session.created_at).toLocaleDateString('ko-KR')} • {session.correct_answers}/{session.total_questions} 문제 • {formatDuration(session.duration_seconds)}
                          </div>
                          {session.best_streak > 0 && (
                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              🔥 최대 {session.best_streak}연속 정답
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${performance.color}`}>
                          {performance.rating}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {session.average_response_time_ms && formatResponseTime(session.average_response_time_ms)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  )
} 