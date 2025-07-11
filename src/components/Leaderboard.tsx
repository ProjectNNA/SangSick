import { useState, useEffect } from 'react'
import { getCategoryEmoji } from '../lib/quizTracking'

export default function Leaderboard({ currentUser }) {
  const [selectedCategory, setSelectedCategory] = useState('points') // 'points', 'accuracy', 'streaks', 'recent'
  const [leaderboardData, setLeaderboardData] = useState({
    points: [],
    accuracy: [],
    streaks: [],
    recent: []
  })
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)

  // Mock data for demonstration - in real app, this would come from Supabase
  useEffect(() => {
    const generateMockData = () => {
      const mockUsers = [
        { id: '1', name: '퀴즈마스터', points: 2850, accuracy: 94, streak: 45, recent_sessions: 12, avatar: null },
        { id: '2', name: '상식왕', points: 2630, accuracy: 89, streak: 38, recent_sessions: 8, avatar: null },
        { id: '3', name: '지식탐구자', points: 2340, accuracy: 92, streak: 25, recent_sessions: 15, avatar: null },
        { id: '4', name: '학습러버', points: 2120, accuracy: 87, streak: 33, recent_sessions: 6, avatar: null },
        { id: '5', name: '도전자', points: 1950, accuracy: 91, streak: 21, recent_sessions: 10, avatar: null },
        { id: '6', name: '열정학습자', points: 1820, accuracy: 85, streak: 28, recent_sessions: 7, avatar: null },
        { id: '7', name: '퀴즈러버', points: 1730, accuracy: 88, streak: 19, recent_sessions: 9, avatar: null },
        { id: '8', name: '지식수집가', points: 1650, accuracy: 90, streak: 15, recent_sessions: 11, avatar: null },
        { id: '9', name: '상식박사', points: 1480, accuracy: 83, streak: 22, recent_sessions: 4, avatar: null },
        { id: '10', name: '학습매니아', points: 1380, accuracy: 86, streak: 17, recent_sessions: 8, avatar: null },
        // Add current user if provided
        ...(currentUser ? [{
          id: currentUser.id,
          name: currentUser.user_metadata?.nickname || '나',
          points: 1200,
          accuracy: 78,
          streak: 8,
          recent_sessions: 5,
          avatar: currentUser.user_metadata?.avatar_url,
          isCurrentUser: true
        }] : [])
      ]

      const pointsRanking = [...mockUsers].sort((a, b) => b.points - a.points)
      const accuracyRanking = [...mockUsers].sort((a, b) => b.accuracy - a.accuracy)
      const streaksRanking = [...mockUsers].sort((a, b) => b.streak - a.streak)
      const recentRanking = [...mockUsers].sort((a, b) => b.recent_sessions - a.recent_sessions)

      setLeaderboardData({
        points: pointsRanking,
        accuracy: accuracyRanking,
        streaks: streaksRanking,
        recent: recentRanking
      })

      // Find current user rank
      if (currentUser) {
        const currentUserRank = pointsRanking.findIndex(user => user.id === currentUser.id) + 1
        setUserRank(currentUserRank)
      }

      setLoading(false)
    }

    generateMockData()
  }, [currentUser])

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'points':
        return {
          title: '🏆 총점 랭킹',
          description: '총 획득 점수 기준',
          getValue: (user) => `${user.points}점`,
          color: 'from-yellow-500 to-orange-500',
          icon: '🏆'
        }
      case 'accuracy':
        return {
          title: '🎯 정확도 랭킹',
          description: '정답률 기준',
          getValue: (user) => `${user.accuracy}%`,
          color: 'from-green-500 to-teal-500',
          icon: '🎯'
        }
      case 'streaks':
        return {
          title: '🔥 연속 기록',
          description: '최장 연속 학습 일수',
          getValue: (user) => `${user.streak}일`,
          color: 'from-orange-500 to-red-500',
          icon: '🔥'
        }
      case 'recent':
        return {
          title: '📈 최근 활동',
          description: '최근 1주일 세션 수',
          getValue: (user) => `${user.recent_sessions}회`,
          color: 'from-blue-500 to-purple-500',
          icon: '📈'
        }
      default:
        return {
          title: '🏆 총점 랭킹',
          description: '총 획득 점수 기준',
          getValue: (user) => `${user.points}점`,
          color: 'from-yellow-500 to-orange-500',
          icon: '🏆'
        }
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
    if (rank === 2) return { emoji: '🥈', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' }
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
    return { emoji: `#${rank}`, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-300">리더보드를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  const config = getCategoryConfig(selectedCategory)
  const currentData = leaderboardData[selectedCategory]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 리더보드
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          다른 사용자들과 경쟁하며 더 높은 순위를 목표로 해보세요!
        </p>
      </div>

      {/* Current User Stats */}
      {currentUser && userRank && (
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">내 순위</h3>
                <p className="text-white/80">전체 랭킹에서의 위치</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">#{userRank}</div>
              <div className="text-white/80">1,200점</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.keys(leaderboardData).map((category) => {
          const categoryConfig = getCategoryConfig(category)
          const isActive = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{categoryConfig.icon}</span>
              {categoryConfig.title.replace(/🏆|🎯|🔥|📈/, '').trim()}
            </button>
          )
        })}
      </div>

      {/* Current Category Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {config.description}
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="text-center order-1">
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg p-4 mb-3 transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div className="text-white font-bold text-lg">{currentData[1]?.name}</div>
              <div className="text-white/80 text-sm">{config.getValue(currentData[1])}</div>
            </div>
            <div className="text-4xl">🥈</div>
          </div>

          {/* 1st Place */}
          <div className="text-center order-2">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 mb-3 transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className="text-white font-bold text-xl">{currentData[0]?.name}</div>
              <div className="text-white/80">{config.getValue(currentData[0])}</div>
            </div>
            <div className="text-5xl">🥇</div>
          </div>

          {/* 3rd Place */}
          <div className="text-center order-3">
            <div className="bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg p-4 mb-3 transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div className="text-white font-bold text-lg">{currentData[2]?.name}</div>
              <div className="text-white/80 text-sm">{config.getValue(currentData[2])}</div>
            </div>
            <div className="text-4xl">🥉</div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          전체 순위
        </h4>
        
        {currentData.map((user, index) => {
          const rank = index + 1
          const badge = getRankBadge(rank)
          const isCurrentUser = user.isCurrentUser
          
          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                isCurrentUser 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500 shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.bg}`}>
                  <span className={`font-bold ${badge.color}`}>
                    {typeof badge.emoji === 'string' && badge.emoji.startsWith('#') 
                      ? badge.emoji 
                      : <span className="text-2xl">{badge.emoji}</span>}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className={`font-semibold ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedCategory === 'points' && `정확도: ${user.accuracy}%`}
                      {selectedCategory === 'accuracy' && `총점: ${user.points}점`}
                      {selectedCategory === 'streaks' && `총점: ${user.points}점`}
                      {selectedCategory === 'recent' && `정확도: ${user.accuracy}%`}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <div className={`text-lg font-bold ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                  {config.getValue(user)}
                </div>
                {rank <= 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {rank === 1 && '퀴즈왕'}
                    {rank === 2 && '2등'}
                    {rank === 3 && '3등'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Competition Info */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          🎯 경쟁 가이드
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                더 많은 퀴즈를 풀어 점수를 높이세요
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                정확도를 높여 순위를 올리세요
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                매일 꾸준히 학습하여 연속 기록을 세우세요
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">📈</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                최근 활동을 늘려 활발한 학습자가 되세요
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 