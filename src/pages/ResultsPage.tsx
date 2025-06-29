import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { updateGameStats } from "../utils/statsUtils";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetQuiz } = useQuiz();

  // Guard to prevent duplicate stats update
  const hasUpdatedStats = useRef(false);

  // Calculate score and save statistics
  useEffect(() => {
    if (
      state.quizCompleted &&
      state.filteredQuestions.length > 0 &&
      !hasUpdatedStats.current
    ) {
      const score = Math.round(
        (state.correctAnswers / state.filteredQuestions.length) * 100
      );

      // Save statistics for classic mode (default for now)
      updateGameStats(
        "classic",
        state.correctAnswers,
        state.filteredQuestions.length,
        score
      );
      hasUpdatedStats.current = true;
    }
  }, [
    state.quizCompleted,
    state.correctAnswers,
    state.filteredQuestions.length,
  ]);

  const handleBackToMenu = () => {
    resetQuiz();
    navigate("/");
  };

  const handleViewStatistics = () => {
    resetQuiz();
    navigate("/statistics");
  };

  const score =
    state.filteredQuestions.length > 0
      ? Math.round(
          (state.correctAnswers / state.filteredQuestions.length) * 100
        )
      : 0;

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "완벽합니다! 🎉";
    if (score >= 80) return "훌륭합니다! 👏";
    if (score >= 70) return "잘 했습니다! 👍";
    if (score >= 60) return "괜찮습니다! 🙂";
    return "더 노력해보세요! 💪";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="py-12 px-6">
      <div className="text-center p-10 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
        <h2 className="text-36px font-bold mb-6 text-green-600">퀴즈 완료!</h2>

        {/* Score Display */}
        <div className="mb-8">
          <div className={`text-48px font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-20px text-gray-700 mb-4">
            {getScoreMessage(score)}
          </p>
          <p className="text-16px text-gray-600">
            정답: {state.correctAnswers} / {state.filteredQuestions.length} 문제
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ${
              score >= 90
                ? "bg-green-500"
                : score >= 80
                ? "bg-blue-500"
                : score >= 70
                ? "bg-yellow-500"
                : score >= 60
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToMenu}
            className="px-8 py-4 bg-blue-600 text-white text-20px rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            메인 메뉴로
          </button>
          <button
            onClick={handleViewStatistics}
            className="px-8 py-4 bg-green-600 text-white text-20px rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            통계 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
