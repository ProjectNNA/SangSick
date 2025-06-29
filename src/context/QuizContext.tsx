import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { Question, QuizState, QuizFilter } from "../types/quiz";

// Define action types
type QuizAction =
  | { type: "LOAD_QUESTIONS"; payload: Question[] }
  | { type: "FILTER_QUESTIONS"; payload: QuizFilter }
  | { type: "SELECT_ANSWER"; payload: number }
  | { type: "SET_QUESTION_COUNT"; payload: number }
  | { type: "START_QUIZ" }
  | { type: "NEXT_QUESTION" }
  | { type: "RESET_QUIZ" };

// Initial state
const initialState: QuizState = {
  questions: [],
  filteredQuestions: [],
  questionCount: 5,
  currentQuestionIndex: 0,
  selectedAnswerIndex: null,
  hasAnswered: false,
  showCorrectAnswer: true, // We now always show the correct answer
  attemptCount: 0,
  quizStarted: false,
  filters: {
    difficulty: null,
    mainCategory: null,
    subCategory: null,
  },
};

// Reducer function
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  console.log("Reducer action:", action.type, action);

  switch (action.type) {
    case "LOAD_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
        filteredQuestions: action.payload,
      };
    case "FILTER_QUESTIONS": {
      const { difficulty, mainCategory, subCategory } = action.payload;

      const filtered = state.questions.filter((q) => {
        const difficultyMatch =
          difficulty === null || q.difficulty === difficulty;
        const mainCategoryMatch =
          mainCategory === null || q.mainCategory === mainCategory;
        const subCategoryMatch =
          subCategory === null || q.subCategory === subCategory;
        return difficultyMatch && mainCategoryMatch && subCategoryMatch;
      });

      console.log("Filtered questions:", filtered.length);

      return {
        ...state,
        filters: action.payload,
        filteredQuestions: filtered,
        currentQuestionIndex: 0,
        selectedAnswerIndex: null,
        hasAnswered: false,
        showCorrectAnswer: true,
        attemptCount: 0,
      };
    }
    case "SET_QUESTION_COUNT":
      return {
        ...state,
        questionCount: action.payload,
      };
    case "START_QUIZ":
      // Shuffle the questions and limit to questionCount
      const shuffled = [...state.filteredQuestions].sort(
        () => 0.5 - Math.random()
      );
      const selectedQuestions = shuffled.slice(0, state.questionCount);

      return {
        ...state,
        filteredQuestions: selectedQuestions,
        quizStarted: true,
        currentQuestionIndex: 0,
        selectedAnswerIndex: null,
        hasAnswered: false,
      };
    case "SELECT_ANSWER": {
      return {
        ...state,
        selectedAnswerIndex: action.payload,
        hasAnswered: true,
        showCorrectAnswer: true,
      };
    }
    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswerIndex: null,
        hasAnswered: false,
      };
    case "RESET_QUIZ":
      return {
        ...state,
        currentQuestionIndex: 0,
        selectedAnswerIndex: null,
        hasAnswered: false,
        quizStarted: false,
      };
    default:
      return state;
  }
}

// Create context
type QuizContextType = {
  state: QuizState;
  loadQuestions: (questions: Question[]) => void;
  filterQuestions: (filters: QuizFilter) => void;
  selectAnswer: (answerIndex: number) => void;
  setQuestionCount: (count: number) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Context provider
export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const loadQuestions = useCallback((questions: Question[]) => {
    console.log("Loading questions:", questions.length);
    dispatch({ type: "LOAD_QUESTIONS", payload: questions });
  }, []);

  const filterQuestions = useCallback((filters: QuizFilter) => {
    console.log("Filtering questions:", filters);
    dispatch({ type: "FILTER_QUESTIONS", payload: filters });
  }, []);

  const selectAnswer = useCallback((answerIndex: number) => {
    console.log("Select answer action:", answerIndex);
    dispatch({ type: "SELECT_ANSWER", payload: answerIndex });
  }, []);

  const setQuestionCount = useCallback((count: number) => {
    console.log("Set question count:", count);
    dispatch({ type: "SET_QUESTION_COUNT", payload: count });
  }, []);

  const startQuiz = useCallback(() => {
    console.log("Start quiz action");
    dispatch({ type: "START_QUIZ" });
  }, []);

  const nextQuestion = useCallback(() => {
    console.log("Next question action");
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const resetQuiz = useCallback(() => {
    console.log("Reset quiz action");
    dispatch({ type: "RESET_QUIZ" });
  }, []);

  // Debug state changes
  React.useEffect(() => {
    console.log("QuizContext state updated:", state);
  }, [state]);

  const value = {
    state,
    loadQuestions,
    filterQuestions,
    selectAnswer,
    setQuestionCount,
    startQuiz,
    nextQuestion,
    resetQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

// Custom hook to use the QuizContext
export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
