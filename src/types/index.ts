// Import Supabase User type to avoid conflicts
import type { User } from '@supabase/supabase-js'
export type { User }

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

// Quiz and Question Types
export interface Question {
  id: number;
  category: string;
  subcategory: string;
  difficulty: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reflection: string;
  totalCount?: number;
  answerCounts?: number[];
}

export interface QuizSession {
  id: string;
  user_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  duration_seconds: number;
  created_at: string;
  best_streak: number;
  average_response_time_ms: number;
}

export interface QuizResults {
  sessionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  attempts: QuestionAttempt[];
  bestStreak?: number;
  averageResponseTime?: number;
}

export interface QuestionAttempt {
  question: Question;
  selectedAnswer: number;
  isCorrect: boolean;
  responseTimeMs: number;
}

// Statistics Types
export interface BasicStats {
  total_sessions?: number;
  completed_sessions: number;
  overall_accuracy: number;
  highest_score: number;
  average_score?: number;
  average_duration_minutes?: number;
  last_played?: string | null;
}

export interface EngagementStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  total_study_time_minutes: number;
  level?: number;
  achievements?: string[];
}

export interface TimePerformance {
  average_response_time_ms: number | null;
  best_performance_hour: number | null;
  questions_by_difficulty?: Record<string, any>;
}

export interface CategoryPerformance {
  category: string;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  accuracy_percentage?: number;
  total_attempts?: number;
  total_points?: number;
  correct_attempts?: number;
  emoji: string;
}

export interface Achievements {
  perfect_sessions: number;
  questions_mastered: number;
  difficulty_breakdown?: Record<string, any>;
}

export interface QuizStats {
  basic_stats: BasicStats;
  engagement_stats: EngagementStats;
  time_performance: TimePerformance;
  category_performance: CategoryPerformance[];
  achievements: Achievements;
}

// Component Props Types
export interface UserProfileProps {
  user: User;
}

export interface QuizGameProps {
  user: User;
  onComplete: (results: QuizResults) => void;
}

export interface StatsPageProps {
  user: User;
}

export interface AdminPageProps {
  user: User;
}

export interface WelcomePageProps {
  onLoginClick: () => void;
}

export interface TimeInsightsProps {
  timeData: TimePerformance;
  engagementStats: EngagementStats;
}

export interface CategoryPerformanceProps {
  categories: CategoryPerformance[];
  onCategoryClick?: (category: string) => void;
}

// Performance Rating Type
export interface PerformanceRating {
  rating: string;
  color: string;
  emoji: string;
} 