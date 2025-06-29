import React from "react";

interface CommentaryProps {
  isCorrect: boolean;
  commentary: string;
}

const Commentary: React.FC<CommentaryProps> = ({ isCorrect, commentary }) => {
  return (
    <div
      className={`p-5 rounded-lg ${isCorrect ? "bg-green-50" : "bg-red-50"}`}
    >
      <div className="flex items-center mb-3">
        {isCorrect ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-green-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="32"
              height="32"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-green-700 text-20px">
              정답입니다!
            </span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="32"
              height="32"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-red-700 text-20px">
              오답입니다
            </span>
          </>
        )}
      </div>
      <p className="text-gray-700 text-16px">{commentary}</p>
    </div>
  );
};

export default Commentary;
