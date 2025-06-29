import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import QuestionCard from "../components/QuestionCard";

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state: {
      filteredQuestions,
      currentQuestionIndex,
      selectedAnswerIndex,
      hasAnswered,
    },
    selectAnswer,
    nextQuestion,
  } = useQuiz();

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // Handle Next button: if last question, go to results, else nextQuestion
  const handleNext = useCallback(() => {
    if (currentQuestionIndex === filteredQuestions.length - 1) {
      navigate("/results");
    } else {
      nextQuestion();
    }
  }, [currentQuestionIndex, filteredQuestions.length, navigate, nextQuestion]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered && e.key === "Enter") {
        handleNext();
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
  }, [hasAnswered, handleNext, selectAnswer, currentQuestion]);

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
        <p className="text-20px text-gray-600">
          선택한 필터에 맞는 문제가 없습니다. 다른 필터를 선택해 주세요.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white text-16px rounded-lg hover:bg-blue-700 transition-colors"
        >
          메인 메뉴로
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-800 font-semibold px-6 py-2 rounded-lg shadow transition-colors z-10"
      >
        메인 메뉴로
      </button>
      <div className="mb-6 text-center">
        <span className="inline-block px-6 py-3 bg-gray-100 rounded-full text-gray-700 font-medium text-16px">
          문제 {currentQuestionIndex + 1} / {filteredQuestions.length}
        </span>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswerIndex={selectedAnswerIndex}
        hasAnswered={hasAnswered}
        onAnswerSelect={selectAnswer}
        onNext={handleNext}
      />
    </div>
  );
};

export default QuizPage;
