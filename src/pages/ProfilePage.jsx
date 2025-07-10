import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilePage({ user }) {
  const [nickname, setNickname] = useState(user.user_metadata?.nickname || '')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

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
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-indigo-600 dark:bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white dark:text-gray-900 font-bold text-3xl">
                {nickname?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {nickname || user.email?.split('@')[0]}님
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
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

        {/* Quiz Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            퀴즈 통계
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                12
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                총 플레이 횟수
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                78%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                평균 정답률
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                850
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                최고 점수
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              💡 <strong>참고:</strong> 통계는 현재 모의 데이터입니다. 향후 실제 플레이 기록으로 업데이트됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 