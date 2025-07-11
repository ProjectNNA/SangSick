import { useState, useEffect } from 'react'
import type { LeaderboardProps, LeaderboardUser, CategoryConfig } from '../types'

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('points')
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardUser[]>>({
    points: [],
    accuracy: [],
    streaks: [],
    recent: []
  })
  const [userRank, setUserRank] = useState<number | null>(null)

  // Mock data for demonstration - in real app this would come from Supabase
  const mockUsers: LeaderboardUser[] = [
    { id: '1', name: '김철수', points: 1250, accuracy: 92, streak: 5, recent_sessions: 12, avatar: null },
    { id: '2', name: '이영희', points: 1100, accuracy: 88, streak: 3, recent_sessions: 8, avatar: null },
    { id: '3', name: '박민수', points: 950, accuracy: 94, streak: 7, recent_sessions: 15, avatar: null },
    { id: '4', name: '최지은', points: 875, accuracy: 85, streak: 2, recent_sessions: 6, avatar: null },
    { id: '5', name: '정호영', points: 820, accuracy: 90, streak: 4, recent_sessions: 10, avatar: null }
  ]

  useEffect(() => {
    // Create leaderboard rankings
    const pointsRanking = [...mockUsers]
      .sort((a, b) => b.points - a.points)
      .map(user => ({
        ...user,
        isCurrentUser: user.id === currentUser?.id
      }))

    const accuracyRanking = [...mockUsers]
      .sort((a, b) => b.accuracy - a.accuracy)
      .map(user => ({
        ...user,
        isCurrentUser: user.id === currentUser?.id
      }))

    const streaksRanking = [...mockUsers]
      .sort((a, b) => b.streak - a.streak)
      .map(user => ({
        ...user,
        isCurrentUser: user.id === currentUser?.id
      }))

    const recentRanking = [...mockUsers]
      .sort((a, b) => b.recent_sessions - a.recent_sessions)
      .map(user => ({
        ...user,
        isCurrentUser: user.id === currentUser?.id
      }))

    setLeaderboardData({
      points: pointsRanking,
      accuracy: accuracyRanking,
      streaks: streaksRanking,
      recent: recentRanking
    })

    // Find current user's rank in selected category
    const currentUserRank = pointsRanking.findIndex(user => user.id === currentUser?.id) + 1
    if (currentUserRank > 0) {
      setUserRank(currentUserRank)
    }
  }, [currentUser])

  const getCategoryConfig = (category: string): CategoryConfig => {
    const configs: Record<string, CategoryConfig> = {
      points: {
        name: '총점',
        emoji: '🏆',
        description: '누적 포인트 순위',
        getValue: (user: LeaderboardUser) => `${user.points}점`,
      },
      accuracy: {
        name: '정확도',
        emoji: '🎯',
        description: '정답률 순위',
        getValue: (user: LeaderboardUser) => `${user.accuracy}%`,
      },
      streaks: {
        name: '연속 기록',
        emoji: '🔥',
        description: '연속 학습 일수',
        getValue: (user: LeaderboardUser) => `${user.streak}일`,
      },
      recent: {
        name: '활동량',
        emoji: '⚡',
        description: '최근 활동량',
        getValue: (user: LeaderboardUser) => `${user.recent_sessions}회`,
      },
      global: {
        name: '종합',
        emoji: '🌟',
        description: '종합 순위',
        getValue: (user: LeaderboardUser) => `${user.points}점`,
      }
    }
    return configs[category] || configs.points
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    if (rank <= 10) return '🏅'
    return `#${rank}`
  }

  const categories = [
    { key: 'points', label: '총점 🏆' },
    { key: 'accuracy', label: '정확도 🎯' },
    { key: 'streaks', label: '연속기록 🔥' },
    { key: 'recent', label: '활동량 ⚡' }
  ]

  const currentData = leaderboardData[selectedCategory] || []
  const config = getCategoryConfig(selectedCategory)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-3xl">{config.emoji}</span>
            리더보드
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {config.description}
          </p>
        </div>
        {userRank && (
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">내 순위</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {getRankBadge(userRank)}
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.key
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {currentData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              아직 리더보드 데이터가 없습니다
            </p>
          </div>
        ) : (
          currentData.map((user: LeaderboardUser, index: number) => {
            const rank = index + 1
            const isCurrentUser = user.isCurrentUser

            return (
              <div
                key={user.id}
                className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
                  isCurrentUser
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-2xl font-bold">
                    {getRankBadge(rank)}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 ml-4">
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-yellow-400 flex items-center justify-center mr-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-white dark:text-gray-900 font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    {/* Name and Status */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          isCurrentUser 
                            ? 'text-indigo-700 dark:text-indigo-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                            나
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {config.getValue(user)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-bold ${
                    isCurrentUser 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {config.getValue(user)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    정확도: {user.accuracy}%
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          💡 더 많이 학습하고 정확도를 높여 순위를 올려보세요!
        </p>
      </div>
    </div>
  )
} 