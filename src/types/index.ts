// Import Supabase User type to avoid conflicts
import type { User } from '@supabase/supabase-js'
import type { Database } from './database.types'
export type { User }

// Export database types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type QuestionRow = Tables<'questions'>
export type QuizSessionRow = Tables<'quiz_sessions'>
export type CategoryPerformanceRow = Tables<'category_performance'>
export type UserEngagementRow = Tables<'user_engagement_stats'>

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

// Statistics Types - aligned with database schema
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
  total_questions_answered?: number; // Added missing property
}

export interface TimePerformance {
  average_response_time_ms: number | null;
  best_performance_hour: number | null;
  fastest_response_time_ms?: number; // Added missing property
  slowest_response_time_ms?: number; // Added missing property
  average_session_duration_minutes?: number; // Added missing property
  questions_by_difficulty?: Record<string, any>;
}

// Updated to match database schema
export interface CategoryPerformance {
  category: string;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  accuracy_percentage?: number;
  total_attempts?: number;
  total_points?: number;
  correct_attempts?: number;
  average_difficulty?: number; // From database schema
  best_streak?: number; // From database schema
  last_attempt_date?: string; // From database schema (was last_attempt)
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

// Component Props Types with proper typing
export interface UserProfileProps {
  user: User;
}

export interface QuizGameProps {
  user: User;
  onComplete: (results: QuizResults | number) => void; // Allow both formats
}

export interface HomePageProps {
  user: User;
}

export interface StatsPageProps {
  user: User;
}

export interface AdminPageProps {
  user: User;
}

export interface ProfilePageProps {
  user: User;
}

export interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
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

export interface LeaderboardProps {
  currentUser: User;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export interface AvatarEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  currentAvatar: string | null;
}

// Performance Rating Type
export interface PerformanceRating {
  rating: string;
  color: string;
  emoji: string;
}

// Leaderboard User Type
export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  accuracy: number;
  streak: number;
  recent_sessions: number;
  avatar: string | null;
  isCurrentUser?: boolean;
}

// Category Configuration Type
export interface CategoryConfig {
  name: string;
  emoji: string;
  description: string;
  getValue: (user: LeaderboardUser) => string;
} 