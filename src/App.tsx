import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizProvider, useQuiz } from "./context/QuizContext";
import MenuPage from "./pages/MenuPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import StatisticsPage from "./pages/StatisticsPage";
import questionsData from "./data/questions.json";

// Main app component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </BrowserRouter>
  );
};

// Quiz app component with routes
const AppContent: React.FC = () => {
  const { loadQuestions } = useQuiz();

  // Load questions on mount
  useEffect(() => {
    loadQuestions(questionsData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>

      <footer className="mt-12 text-center text-gray-500 text-16px py-6">
        <p>© 2025 퀴즈 퀴즈 페스티벌</p>
      </footer>
    </div>
  );
};

export default App;
