import React from "react";

interface AnswerOptionProps {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  hasAnswered: boolean;
  showCorrectAnswer: boolean;
  onSelect: () => void;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  index,
  isSelected,
  isCorrect,
  hasAnswered,
  showCorrectAnswer,
  onSelect,
}) => {
  // Determine the styling based on selection and correctness
  const getOptionClasses = () => {
    let baseClasses =
      "flex items-center w-full p-5 border rounded-lg cursor-pointer transition-colors";

    if (!hasAnswered) {
      return `${baseClasses} ${
        isSelected
          ? "bg-blue-100 border-blue-500"
          : "bg-white hover:bg-gray-50 border-gray-300"
      }`;
    }

    // After answering, always color correct and incorrect options
    if (isCorrect) {
      return `${baseClasses} bg-green-100 border-green-500 text-green-800`;
    }
    if (isSelected && !isCorrect) {
      return `${baseClasses} bg-red-100 border-red-500 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 border-gray-300 text-gray-600 opacity-70`;
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !hasAnswered) {
      e.preventDefault();
      onSelect();
    }
  };

  // Do not allow selection if already answered
  const handleClick = () => {
    if (!hasAnswered) {
      onSelect();
    }
  };

  return (
    <div
      className={getOptionClasses()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-disabled={hasAnswered}
    >
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 flex items-center justify-center rounded-full mr-4 text-16px font-medium border">
          {String.fromCharCode(65 + index)}
        </div>
        <span className="text-gray-700 text-16px">{text}</span>
      </div>

      {hasAnswered && showCorrectAnswer && isCorrect && (
        <div className="ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            width="32"
            height="32"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {hasAnswered && showCorrectAnswer && isSelected && !isCorrect && (
        <div className="ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            width="32"
            height="32"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AnswerOption;
