import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetQuiz } = useQuiz();

  const handleBackToMenu = () => {
    resetQuiz();
    navigate("/");
  };

  return (
    <div className="py-12 px-6">
      <div className="text-center p-10 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
        <h2 className="text-36px font-bold mb-6 text-green-600">퀴즈 완료!</h2>
        <p className="text-26px mb-8 text-gray-700">수고하셨습니다!</p>
        <button
          onClick={handleBackToMenu}
          className="px-8 py-4 bg-blue-600 text-white text-20px rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          메인 메뉴로
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
