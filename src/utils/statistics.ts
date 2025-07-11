// Statistics utility functions for quiz answers
import type { Question } from '../types'

/**
 * Update answer statistics when a user selects an answer
 * @param {Array} questions - Array of all questions
 * @param {number} questionId - ID of the question being answered
 * @param {number} selectedAnswer - Index of the selected answer (0-3)
 * @returns {Array} Updated questions array
 */
export const updateAnswerStatistics = (questions: Question[], questionId: number, selectedAnswer: number | null): Question[] => {
  return questions.map(question => {
    if (question.id === questionId) {
      const updatedAnswerCounts = [...(question.answerCounts || [0, 0, 0, 0, 0])];
      if (selectedAnswer === null || selectedAnswer === undefined) {
        updatedAnswerCounts[4]++; // unanswered
      } else {
        updatedAnswerCounts[selectedAnswer]++;
      }
      return {
        ...question,
        totalCount: (question.totalCount || 0) + 1,
        answerCounts: updatedAnswerCounts
      };
    }
    return question;
  });
};

/**
 * Calculate percentage for each answer option
 * @param {number} count - Number of times this option was selected
 * @param {number} total - Total number of answers for this question
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

/**
 * Get percentage for each answer option of a question
 * @param {Object} question - Question object with answerCounts and totalCount
 * @returns {Array} Array of percentages for each option
 */
export const getAnswerPercentages = (question: Question): number[] => {
  const answerCounts = question.answerCounts || [0, 0, 0, 0, 0];
  const totalCount = question.totalCount || 0;
  const unanswered = answerCounts[4] || 0;
  const answeredTotal = totalCount - unanswered;
  if (answeredTotal === 0) return [0, 0, 0, 0];
  return answerCounts.slice(0, 4).map((count: number) =>
    Math.round((count / answeredTotal) * 100)
  );
};

/**
 * Save statistics to localStorage
 * @param {Array} questions - Questions array with statistics
 */
export const saveStatistics = (questions: Question[]): void => {
  try {
    localStorage.setItem('quizStatistics', JSON.stringify(questions));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
};

/**
 * Load statistics from localStorage
 * @param {Array} questions - Original questions array
 * @returns {Array} Questions array with loaded statistics
 */
export const loadStatistics = (questions: Question[]): Question[] => {
  try {
    const savedStats = localStorage.getItem('quizStatistics');
    if (savedStats) {
      const statsData = JSON.parse(savedStats);
      
      // Merge saved statistics with current questions
      return questions.map((question: Question) => {
        const savedQuestion = statsData.find((q: any) => q.id === question.id);
        if (savedQuestion) {
          return {
            ...question,
            totalCount: savedQuestion.totalCount || 0,
            answerCounts: savedQuestion.answerCounts || [0, 0, 0, 0, 0]
          };
        }
        return {
          ...question,
          totalCount: 0,
          answerCounts: [0, 0, 0, 0, 0]
        };
      });
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
  
  // Return questions with default statistics if loading fails
  return questions.map((question: Question) => ({
    ...question,
    totalCount: 0,
    answerCounts: [0, 0, 0, 0, 0]
  }));
}; 