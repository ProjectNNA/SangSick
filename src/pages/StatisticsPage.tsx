import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useQuiz } from "../context/QuizContext";
import { GameStats, GameMode, initialGameStats } from "../data/gameStats";
import { loadGameStats } from "../utils/statsUtils";

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<typeof initialGameStats>(initialGameStats);
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = loadGameStats();
    setStats(savedStats);
  }, []);

  const handleBackToMenu = () => {
    navigate("/");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "아직 플레이하지 않음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getModeDisplayName = (mode: GameMode) => {
    switch (mode) {
      case "classic":
        return "클래식";
      case "timed":
        return "타임어택";
      case "challenge":
        return "챌린지";
      default:
        return mode;
    }
  };

  const getAchievementBadges = (modeStats: GameStats) => {
    const badges = [];
    const accuracy = calculateAccuracy(
      modeStats.totalCorrect,
      modeStats.totalQuestions
    );

    if (modeStats.totalGames >= 10) {
      badges.push({
        name: "열심히 하는 사람",
        color: "bg-blue-500",
        icon: "🏆",
      });
    }
    if (accuracy >= 90 && modeStats.totalQuestions > 0) {
      badges.push({ name: "천재", color: "bg-yellow-500", icon: "🧠" });
    }
    if (modeStats.bestScore >= 95) {
      badges.push({ name: "완벽주의자", color: "bg-purple-500", icon: "⭐" });
    }
    if (modeStats.totalGames >= 5) {
      badges.push({ name: "꾸준함", color: "bg-green-500", icon: "📚" });
    }

    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-36px font-bold text-gray-800">게임 통계</h1>
            <button
              onClick={handleBackToMenu}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-16px py-3 px-6 rounded-lg transition-colors"
            >
              메인 메뉴로
            </button>
          </div>

          {/* Game Mode Selector */}
          <div className="flex space-x-2 mb-4">
            {(["classic", "timed", "challenge"] as GameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 rounded text-14px font-medium transition-colors ${
                  selectedMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {getModeDisplayName(mode)}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Games */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-16px">총 게임 수</p>
                <p className="text-36px font-bold text-blue-600">
                  {stats[selectedMode].totalGames}
                </p>
              </div>
              <div className="text-32px">🎮</div>
            </div>
          </div>

          {/* Total Questions */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-16px">총 문제 수</p>
                <p className="text-36px font-bold text-green-600">
                  {stats[selectedMode].totalQuestions}
                </p>
              </div>
              <div className="text-32px">❓</div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-16px">정확도</p>
                <p className="text-36px font-bold text-purple-600">
                  {calculateAccuracy(
                    stats[selectedMode].totalCorrect,
                    stats[selectedMode].totalQuestions
                  )}
                  %
                </p>
              </div>
              <div className="text-32px">🎯</div>
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-16px">최고 점수</p>
                <p className="text-36px font-bold text-yellow-600">
                  {stats[selectedMode].bestScore}%
                </p>
              </div>
              <div className="text-32px">🏆</div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-26px font-bold text-gray-800 mb-6">
              성과 분석
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-16px text-gray-600">정답 수</span>
                <span className="text-20px font-bold text-green-600">
                  {stats[selectedMode].totalCorrect} /{" "}
                  {stats[selectedMode].totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculateAccuracy(
                      stats[selectedMode].totalCorrect,
                      stats[selectedMode].totalQuestions
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <span className="text-16px text-gray-600">마지막 점수</span>
                <span className="text-20px font-bold text-blue-600">
                  {stats[selectedMode].lastScore}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-16px text-gray-600">평균 점수</span>
                <span className="text-20px font-bold text-purple-600">
                  {stats[selectedMode].totalQuestions > 0
                    ? Math.round(
                        (stats[selectedMode].totalCorrect /
                          stats[selectedMode].totalQuestions) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-26px font-bold text-gray-800 mb-6">업적</h2>
            <div className="space-y-4">
              {getAchievementBadges(stats[selectedMode]).map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`${badge.color} text-white p-3 rounded-full text-20px`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-16px font-bold text-gray-800">
                      {badge.name}
                    </p>
                    <p className="text-14px text-gray-600">업적 획득!</p>
                  </div>
                </div>
              ))}
              {getAchievementBadges(stats[selectedMode]).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-16px">아직 업적이 없습니다.</p>
                  <p className="text-14px">더 많은 게임을 플레이해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow-lg rounded-lg p-8 mt-8">
          <h2 className="text-26px font-bold text-gray-800 mb-6">최근 활동</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-32px">📅</div>
                <div>
                  <p className="text-16px font-bold text-gray-800">
                    마지막 플레이
                  </p>
                  <p className="text-14px text-gray-600">
                    {formatDate(stats[selectedMode].lastPlayed)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-20px font-bold text-blue-600">
                  {stats[selectedMode].lastScore}%
                </p>
                <p className="text-14px text-gray-600">점수</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
