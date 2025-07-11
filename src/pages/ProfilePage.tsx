import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import AvatarEditor from '../components/AvatarEditor'
import { 
  getUserQuizStats, 
  calculateUserLevel,
  getLevelProgress
} from '../lib/quizTracking'

export default function ProfilePage({ user }) {
  const [nickname, setNickname] = useState(user.user_metadata?.nickname || '')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(user.user_metadata?.avatar_url || null)
  const [quizStats, setQuizStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { nickname }
      })
      
      if (error) throw error
      
      setIsEditing(false)
      alert('프로필이 업데이트되었습니다!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('프로필 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNickname(user.user_metadata?.nickname || '')
    setIsEditing(false)
  }

  const handleAvatarUpdate = (newAvatarUrl) => {
    setCurrentAvatar(newAvatarUrl)
  }

  // Fetch basic quiz statistics
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user?.id) return
      
      setStatsLoading(true)
      try {
        const stats = await getUserQuizStats(user.id)
        setQuizStats(stats)
      } catch (error) {
        console.error('Error fetching quiz data:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchQuizData()
  }, [user?.id])

  // Calculate user level and progress
  const userLevel = quizStats?.engagement_stats?.total_points 
    ? calculateUserLevel(quizStats.engagement_stats.total_points)
    : 1
  
  const levelProgress = quizStats?.engagement_stats?.total_points
    ? getLevelProgress(quizStats.engagement_stats.total_points)
    : { level: 1, progress: 0, needed: 100, percentage: 0 }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            내 프로필
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            프로필 정보를 확인하고 수정할 수 있습니다
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-8">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4 w-24 h-24">
              <Avatar 
                avatarUrl={currentAvatar}
                fallback={nickname || user.email?.split('@')[0]}
                size="xl"
                onClick={isEditing ? () => setShowAvatarEditor(true) : undefined}
              />
              {/* Edit icon overlay - only show when editing */}
              {isEditing && (
                <div 
                  className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowAvatarEditor(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {nickname || user.email?.split('@')[0]}님
              </h2>
              {/* Level Badge */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                LV.{userLevel}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
            
            {/* Level Progress Bar */}
            {quizStats?.engagement_stats?.total_points > 0 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>다음 레벨까지</span>
                  <span>{levelProgress.progress}/{levelProgress.needed}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                닉네임
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="닉네임을 입력하세요"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                  {nickname || '닉네임을 설정해주세요'}
                </div>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                {user.email}
              </div>
            </div>

            {/* Account Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                계정 정보
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">가입일:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">최근 로그인:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                프로필 편집
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              📊 퀴즈 요약
            </h3>
            {/* Link to detailed stats */}
            <a 
              href="/stats"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>상세 통계 보기</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600 dark:text-gray-300">통계를 불러오는 중...</div>
            </div>
          ) : quizStats && quizStats.basic_stats ? (
            <>
              {/* Essential Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {quizStats.basic_stats.completed_sessions || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    완료 세션
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quizStats.basic_stats.overall_accuracy || 0}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    정답률
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {quizStats.basic_stats.highest_score || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    최고 점수
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {quizStats.engagement_stats?.total_points || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    총 점수
                  </div>
                </div>
              </div>

              {/* Quick insights */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {quizStats.engagement_stats?.current_streak > 0 ? (
                      <>
                        <span className="text-2xl">🔥</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {quizStats.engagement_stats.current_streak}일 연속 학습 중!
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            최장 기록: {quizStats.engagement_stats.longest_streak || 0}일
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            퀴즈에 도전해보세요!
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            연속 학습으로 레벨을 올려보세요
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <a 
                    href="/stats"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    분석 보기
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                첫 퀴즈에 도전해보세요!
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                퀴즈를 완료하면 상세한 통계가 표시됩니다
              </p>
              <a 
                href="/"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                퀴즈 시작하기
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {showAvatarEditor && (
        <AvatarEditor
          user={user}
          currentAvatar={currentAvatar}
          onAvatarUpdate={handleAvatarUpdate}
          onClose={() => setShowAvatarEditor(false)}
        />
      )}
    </div>
  )
} 