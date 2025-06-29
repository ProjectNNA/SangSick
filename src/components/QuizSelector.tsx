import React, { useState, useEffect } from "react";
import { Question, QuizFilter } from "../types/quiz";

interface QuizSelectorProps {
  questions: Question[];
  onFilterChange: (filters: QuizFilter) => void;
}

const QuizSelector: React.FC<QuizSelectorProps> = ({
  questions,
  onFilterChange,
}) => {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [mainCategory, setMainCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  // Extract unique main categories on mount
  useEffect(() => {
    if (questions.length > 0) {
      const uniqueMain = Array.from(
        new Set(questions.map((q) => q.mainCategory))
      );
      setMainCategories(uniqueMain);
    }
  }, [questions]);

  // Update subcategories when mainCategory changes
  useEffect(() => {
    if (mainCategory) {
      const uniqueSub = Array.from(
        new Set(
          questions
            .filter((q) => q.mainCategory === mainCategory)
            .map((q) => q.subCategory)
        )
      );
      setSubCategories(uniqueSub);
      setSubCategory(null); // Reset subcategory when main changes
    } else {
      setSubCategories([]);
      setSubCategory(null);
    }
  }, [mainCategory, questions]);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({ difficulty, mainCategory, subCategory });
  }, [difficulty, mainCategory, subCategory, onFilterChange]);

  // Helper function to render difficulty stars for selection
  const renderDifficultyOptions = () => {
    return (
      <div className="flex flex-col space-y-3">
        <h3 className="font-medium text-20px text-gray-700">난이도 선택</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setDifficulty(null)}
            className={`px-4 py-2 rounded-md text-16px ${
              difficulty === null
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            모든 난이도
          </button>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(difficulty === level ? null : level)}
              className={`flex items-center px-4 py-2 rounded-md text-16px ${
                difficulty === level
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {Array(level)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-yellow-400 text-20px">
                    ★
                  </span>
                ))}
              {Array(5 - level)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-gray-300 text-20px">
                    ★
                  </span>
                ))}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 max-w-3xl mx-auto">
      <h2 className="text-26px font-bold text-gray-800 mb-6">퀴즈 선택</h2>

      {renderDifficultyOptions()}

      <div className="mt-6">
        <h3 className="font-medium text-20px text-gray-700 mb-3">
          메인 카테고리
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMainCategory(null)}
            className={`px-4 py-2 rounded-md text-16px ${
              mainCategory === null
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            전체
          </button>
          {mainCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setMainCategory(mainCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-md text-16px ${
                mainCategory === cat
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {mainCategory && (
        <div className="mt-4">
          <h3 className="font-medium text-20px text-gray-700 mb-3">
            서브 카테고리
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubCategory(null)}
              className={`px-4 py-2 rounded-md text-16px ${
                subCategory === null
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              전체
            </button>
            {subCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSubCategory(subCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-md text-16px ${
                  subCategory === cat
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-16px text-gray-500">
            {questions.length} 문제 중{" "}
            {getFilteredCount(questions, difficulty, mainCategory, subCategory)}{" "}
            문제 선택됨
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to count filtered questions
const getFilteredCount = (
  questions: Question[],
  difficulty: number | null,
  mainCategory: string | null,
  subCategory: string | null
) => {
  return questions.filter((q) => {
    const difficultyMatch = difficulty === null || q.difficulty === difficulty;
    const mainCategoryMatch =
      mainCategory === null || q.mainCategory === mainCategory;
    const subCategoryMatch =
      subCategory === null || q.subCategory === subCategory;
    return difficultyMatch && mainCategoryMatch && subCategoryMatch;
  }).length;
};

export default QuizSelector;
