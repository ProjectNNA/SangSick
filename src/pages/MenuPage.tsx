import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { Question } from "../types/quiz";

const MenuPage: React.FC = () => {
  const { state, setQuestionCount, startQuiz, filterQuestions } = useQuiz();
  const [selectedCount, setSelectedCount] = useState(5);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [mainCategory, setMainCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(
    state.questions
  );
  const navigate = useNavigate();

  // Extract unique categories
  useEffect(() => {
    if (state.questions.length > 0) {
      const uniqueCategories = Array.from(
        new Set(state.questions.map((q) => q.mainCategory))
      );
      setCategories(uniqueCategories);
    }
  }, [state.questions]);

  // Update filtered questions when filters change
  useEffect(() => {
    const filtered = state.questions.filter((q) => {
      const difficultyMatch =
        difficulty === null || q.difficulty === difficulty;
      const mainCategoryMatch =
        mainCategory === null || q.mainCategory === mainCategory;
      const subCategoryMatch =
        subCategory === null || q.subCategory === subCategory;
      return difficultyMatch && mainCategoryMatch && subCategoryMatch;
    });
    setFilteredQuestions(filtered);
    filterQuestions({ difficulty, mainCategory, subCategory });
    // Reset question count if current selection is too high
    if (selectedCount > filtered.length) {
      setSelectedCount(filtered.length);
    }
  }, [difficulty, mainCategory, subCategory, state.questions, filterQuestions]);

  // Update subCategories when mainCategory changes
  useEffect(() => {
    if (mainCategory) {
      const uniqueSubs = Array.from(
        new Set(
          state.questions
            .filter((q) => q.mainCategory === mainCategory)
            .map((q) => q.subCategory)
        )
      );
      setSubCategories(uniqueSubs);
      setSubCategory(null); // Reset subcategory when main changes
    } else {
      setSubCategories([]);
      setSubCategory(null);
    }
  }, [mainCategory, state.questions]);

  // Handle dropdown changes
  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setSelectedCount(count);
  };
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDifficulty(val === "all" ? null : parseInt(val));
  };
  const handleMainCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    setMainCategory(val === "all" ? null : val);
  };
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSubCategory(val === "all" ? null : val);
  };

  const handleStartQuiz = () => {
    setQuestionCount(selectedCount);
    startQuiz();
    navigate("/quiz");
  };

  return (
    <div className="py-12 px-6">
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-lg mx-auto">
        <h1 className="text-36px font-bold text-center text-blue-600 mb-8">
          퀴즈 퀴즈 페스티벌
        </h1>
        <p className="text-20px text-gray-700 mb-8 text-center">
          다양한 주제의 퀴즈로 당신의 지식을 테스트하세요!
        </p>
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-between">
            {/* 난이도 */}
            <div className="flex-1 min-w-0">
              <label className="block text-gray-700 text-20px font-medium mb-2">
                난이도
              </label>
              <select
                value={difficulty === null ? "all" : difficulty}
                onChange={handleDifficultyChange}
                className="w-full p-3 border border-gray-300 rounded-md text-16px"
              >
                <option value="all">전체</option>
                <option value={1}>★</option>
                <option value={2}>★★</option>
                <option value={3}>★★★</option>
                <option value={4}>★★★★</option>
                <option value={5}>★★★★★</option>
              </select>
            </div>
            {/* 카테고리 */}
            <div className="flex-1 min-w-0">
              <label className="block text-gray-700 text-20px font-medium mb-2">
                카테고리
              </label>
              <select
                value={mainCategory === null ? "all" : mainCategory}
                onChange={handleMainCategoryChange}
                className="w-full p-3 border border-gray-300 rounded-md text-16px"
              >
                <option value="all">전체</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* 서브 카테고리 */}
            <div className="flex-1 min-w-0">
              <label className="block text-gray-700 text-20px font-medium mb-2">
                서브 카테고리
              </label>
              <select
                value={subCategory === null ? "all" : subCategory}
                onChange={handleSubCategoryChange}
                className="w-full p-3 border border-gray-300 rounded-md text-16px"
                disabled={!mainCategory}
              >
                <option value="all">전체</option>
                {subCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* 문제 수 */}
            <div className="flex-1 min-w-0">
              <label className="block text-gray-700 text-20px font-medium mb-2">
                문제 수
              </label>
              <select
                value={selectedCount}
                onChange={handleCountChange}
                className="w-full p-3 border border-gray-300 rounded-md text-16px"
              >
                {[3, 5, 10]
                  .filter((n) => n <= filteredQuestions.length)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n} 문제
                    </option>
                  ))}
                {filteredQuestions.length > 0 && (
                  <option value={filteredQuestions.length}>
                    전체 ({filteredQuestions.length} 문제)
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-20px py-4 px-8 rounded-lg transition-colors shadow-md"
            disabled={filteredQuestions.length === 0}
          >
            퀴즈 시작하기
          </button>
        </div>
        {filteredQuestions.length === 0 && (
          <div className="mt-6 text-center text-red-500 text-16px">
            선택한 필터에 맞는 문제가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
