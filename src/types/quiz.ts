export interface Question {
  id: string;
  difficulty: number; // 1 (easiest) to 5 (hardest)
  mainCategory: string;
  subCategory: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  additionalCommentary: string;
}

export interface QuizFilter {
  difficulty: number | null; // 1 to 5
  mainCategory: string | null;
  subCategory: string | null;
}

export interface QuizState {
  questions: Question[];
  filteredQuestions: Question[];
  questionCount: number;
  currentQuestionIndex: number;
  selectedAnswerIndex: number | null;
  hasAnswered: boolean;
  showCorrectAnswer: boolean;
  attemptCount: number;
  quizStarted: boolean;
  correctAnswers: number;
  quizCompleted: boolean;
  filters: QuizFilter;
} 