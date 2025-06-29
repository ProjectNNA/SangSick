import React, { useEffect } from "react";
import { useQuiz } from "../context/QuizContext";
import QuestionCard from "./QuestionCard";

const QuizContainer: React.FC = () => {
  const {
    state: {
      filteredQuestions,
      currentQuestionIndex,
      selectedAnswerIndex,
      hasAnswered,
    },
    selectAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuiz();

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isQuizCompleted = currentQuestionIndex >= filteredQuestions.length;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered && e.key === "Enter") {
        nextQuestion();
      } else if (!hasAnswered) {
        // Select answer with number keys 1-4
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= 4 && currentQuestion) {
          selectAnswer(numKey - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasAnswered, nextQuestion, selectAnswer, currentQuestion]);

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
        <p className="text-lg text-gray-600">
          선택한 필터에 맞는 문제가 없습니다. 다른 필터를 선택해 주세요.
        </p>
      </div>
    );
  }

  if (isQuizCompleted) {
    return (
      <div className="text-center p-10 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-green-600">퀴즈 완료!</h2>
        <p className="text-xl mb-8 text-gray-700">수고하셨습니다!</p>
        <button
          onClick={resetQuiz}
          className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          메인 메뉴로
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="inline-block px-6 py-3 bg-gray-100 rounded-full text-gray-700 font-medium">
          문제 {currentQuestionIndex + 1} / {filteredQuestions.length}
        </span>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswerIndex={selectedAnswerIndex}
        hasAnswered={hasAnswered}
        onAnswerSelect={selectAnswer}
        onNext={nextQuestion}
      />
    </div>
  );
};

export default QuizContainer;
