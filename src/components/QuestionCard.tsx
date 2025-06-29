import React from "react";
import { Question } from "../types/quiz";
import AnswerOption from "./AnswerOption";
import Commentary from "./Commentary";

interface QuestionCardProps {
  question: Question;
  selectedAnswerIndex: number | null;
  hasAnswered: boolean;
  onAnswerSelect: (index: number) => void;
  onNext: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswerIndex,
  hasAnswered,
  onAnswerSelect,
  onNext,
}) => {
  // Helper function to render difficulty stars
  const renderDifficulty = (difficulty: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <span
          key={index}
          style={{ color: index < difficulty ? "#FFD700" : "#D1D5DB" }}
          className="text-26px"
        >
          ★
        </span>
      ));
  };

  // Get the current status of the answer
  const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-16px font-medium">
          {question.mainCategory} | {question.subCategory}
        </span>
        <div className="flex items-center gap-2">
          {renderDifficulty(question.difficulty)}
        </div>
      </div>

      <h2 className="text-26px font-semibold mb-8">{question.questionText}</h2>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            index={index}
            isSelected={selectedAnswerIndex === index}
            isCorrect={index === question.correctAnswerIndex}
            hasAnswered={hasAnswered}
            showCorrectAnswer={hasAnswered}
            onSelect={() => onAnswerSelect(index)}
          />
        ))}
      </div>

      {hasAnswered && (
        <div className="mt-8">
          <Commentary
            isCorrect={isCorrect}
            commentary={question.additionalCommentary}
          />

          <div className="mt-8 flex justify-center">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-blue-600 text-white text-20px rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              다음 문제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
