import React, { useState } from "react";
import { useQuiz } from "../context/QuizContext";

interface MenuProps {
  onStartQuiz: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartQuiz }) => {
  const { state, setQuestionCount } = useQuiz();
  const [selectedCount, setSelectedCount] = useState(5);

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setSelectedCount(count);
  };

  const handleStartQuiz = () => {
    setQuestionCount(selectedCount);
    onStartQuiz();
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-10 max-w-lg mx-auto">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
        퀴즈 퀴즈 페스티벌
      </h1>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-6 text-center">
          다양한 주제의 퀴즈로 당신의 지식을 테스트하세요!
        </p>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-3">
              풀고 싶은 문제 수를 선택하세요
            </label>
            <select
              value={selectedCount}
              onChange={handleCountChange}
              className="w-full p-3 border border-gray-300 rounded-md text-lg"
            >
              <option value={3}>3 문제</option>
              <option value={5}>5 문제</option>
              <option value={10}>10 문제</option>
              {state.questions.length > 0 && (
                <option value={state.questions.length}>
                  모든 문제 ({state.questions.length})
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleStartQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-lg transition-colors shadow-md"
        >
          퀴즈 시작하기
        </button>
      </div>
    </div>
  );
};

export default Menu;
