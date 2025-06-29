import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { Question } from "../types/quiz";

const MenuPage: React.FC = () => {
  const { state, setQuestionCount, startQuiz, filterQuestions } = useQuiz();
  const [selectedCount, setSelectedCount] = useState(3);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [mainCategory, setMainCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(
    state.questions
  );
  const [showFilters, setShowFilters] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const navigate = useNavigate();

  // Ensure context is initialized with all questions on first mount
  React.useEffect(() => {
    // Only call filterQuestions if questions are already loaded
    if (state.questions.length > 0) {
      filterQuestions({
        difficulty: null,
        mainCategory: null,
        subCategory: null,
      });
    }
  }, [state.questions.length]); // Depend on questions.length instead of empty array

  // Extract unique categories
  useEffect(() => {
    if (state.questions.length > 0) {
      const uniqueCategories = Array.from(
        new Set(state.questions.map((q) => q.mainCategory))
      );
      setCategories(uniqueCategories);
    }
  }, [state.questions]);

  // Initialize with context state and apply default filters
  useEffect(() => {
    // Initialize local state with context state
    setDifficulty(state.filters.difficulty);
    setMainCategory(state.filters.mainCategory);
    setSubCategory(state.filters.subCategory);

    // If no filters are applied (all null), ensure we have all questions available
    if (
      state.filters.difficulty === null &&
      state.filters.mainCategory === null &&
      state.filters.subCategory === null
    ) {
      setFilteredQuestions(state.questions);
    } else {
      setFilteredQuestions(state.filteredQuestions);
    }
  }, [state.questions, state.filters, state.filteredQuestions]);

  // Update filtered questions when local filters change (but don't call filterQuestions)
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

    // Reset question count if current selection is too high
    if (selectedCount > filtered.length) {
      setSelectedCount(Math.min(selectedCount, filtered.length));
    }
  }, [difficulty, mainCategory, subCategory, state.questions, selectedCount]);

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

  // Keep selectedCount in sync with filteredQuestions
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      if (selectedCount === 0 || selectedCount > filteredQuestions.length) {
        setSelectedCount(Math.min(5, filteredQuestions.length));
      }
    }
  }, [filteredQuestions, selectedCount]);

  // Navigate to quiz only after quiz is started and questions are ready
  React.useEffect(() => {
    if (
      pendingStart &&
      state.quizStarted &&
      state.filteredQuestions.length > 0
    ) {
      setPendingStart(false);
      navigate("/quiz");
    }
  }, [
    pendingStart,
    state.quizStarted,
    state.filteredQuestions.length,
    navigate,
  ]);

  // Handle dropdown changes
  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setSelectedCount(count);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newDifficulty = val === "all" ? null : parseInt(val);
    setDifficulty(newDifficulty);
    // Apply filter to context
    filterQuestions({ difficulty: newDifficulty, mainCategory, subCategory });
  };

  const handleMainCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    const newMainCategory = val === "all" ? null : val;
    setMainCategory(newMainCategory);
    // Apply filter to context
    filterQuestions({ difficulty, mainCategory: newMainCategory, subCategory });
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newSubCategory = val === "all" ? null : val;
    setSubCategory(newSubCategory);
    // Apply filter to context
    filterQuestions({ difficulty, mainCategory, subCategory: newSubCategory });
  };

  const handleStartQuiz = () => {
    if (selectedCount <= 0) {
      alert("문제 수를 선택하세요!");
      return;
    }
    setQuestionCount(selectedCount);
    startQuiz();
    setPendingStart(true);
  };

  const handleStatistics = () => {
    navigate("/statistics");
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="bg-gray-50 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full mx-auto mt-4">
        <h1 className="text-36px font-bold text-center text-blue-600 mb-4">
          퀴즈 퀴즈 페스티벌
        </h1>
        <p className="text-20px text-gray-700 mb-6 text-center">
          다양한 주제의 퀴즈로 당신의 지식을 테스트하세요!
        </p>

        {showFilters && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
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
                  {filteredQuestions.length > 0 &&
                    ![3, 5, 10].includes(filteredQuestions.length) && (
                      <option value={filteredQuestions.length}>
                        전체 ({filteredQuestions.length} 문제)
                      </option>
                    )}
                </select>
              </div>
            </div>
          </div>
        )}

        {filteredQuestions.length === 0 && showFilters && (
          <div className="text-center text-red-500 text-16px mb-6">
            선택한 필터에 맞는 문제가 없습니다.
          </div>
        )}

        <div className="mt-4 w-full">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleStartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-20px py-4 px-8 rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
              disabled={filteredQuestions.length === 0}
            >
              퀴즈 시작하기
            </button>
            <button
              onClick={handleStatistics}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-20px py-4 px-8 rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
            >
              통계 보기
            </button>
            <button
              onClick={toggleFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-20px py-4 px-8 rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
            >
              필터
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
