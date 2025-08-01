export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      category_performance: {
        Row: {
          average_difficulty: number | null
          best_streak: number | null
          category: string
          correct_attempts: number | null
          created_at: string | null
          id: string
          last_attempt_date: string | null
          total_attempts: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_difficulty?: number | null
          best_streak?: number | null
          category: string
          correct_attempts?: number | null
          created_at?: string | null
          id?: string
          last_attempt_date?: string | null
          total_attempts?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_difficulty?: number | null
          best_streak?: number | null
          category?: string
          correct_attempts?: number | null
          created_at?: string | null
          id?: string
          last_attempt_date?: string | null
          total_attempts?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempted_at: string | null
          category: string
          correct_answer: number
          difficulty: number
          id: string
          is_correct: boolean
          points_earned: number
          question_id: number
          response_time_ms: number | null
          selected_answer: number | null
          session_id: string
          subcategory: string | null
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          category: string
          correct_answer: number
          difficulty: number
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: number
          response_time_ms?: number | null
          selected_answer?: number | null
          session_id: string
          subcategory?: string | null
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          category?: string
          correct_answer?: number
          difficulty?: number
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: number
          response_time_ms?: number | null
          selected_answer?: number | null
          session_id?: string
          subcategory?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answerCounts: Json | null
          category: string
          correctAnswer: number
          created_at: string | null
          difficulty: number
          explanation: string | null
          id: number
          options: Json
          question: string
          reflection: string | null
          subcategory: string
          totalCount: number | null
          updated_at: string | null
        }
        Insert: {
          answerCounts?: Json | null
          category: string
          correctAnswer: number
          created_at?: string | null
          difficulty: number
          explanation?: string | null
          id?: number
          options: Json
          question: string
          reflection?: string | null
          subcategory: string
          totalCount?: number | null
          updated_at?: string | null
        }
        Update: {
          answerCounts?: Json | null
          category?: string
          correctAnswer?: number
          created_at?: string | null
          difficulty?: number
          explanation?: string | null
          id?: number
          options?: Json
          question?: string
          reflection?: string | null
          subcategory?: string
          totalCount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          average_response_time_ms: number | null
          best_streak: number | null
          completed: boolean
          correct_answers: number
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          questions_attempted: number
          score: number
          session_type: string | null
          start_time: string
          total_questions: number
          user_id: string
        }
        Insert: {
          average_response_time_ms?: number | null
          best_streak?: number | null
          completed?: boolean
          correct_answers?: number
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          questions_attempted?: number
          score?: number
          session_type?: string | null
          start_time?: string
          total_questions?: number
          user_id: string
        }
        Update: {
          average_response_time_ms?: number | null
          best_streak?: number | null
          completed?: boolean
          correct_answers?: number
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          questions_attempted?: number
          score?: number
          session_type?: string | null
          start_time?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_stats: {
        Row: {
          achievements: string[] | null
          created_at: string | null
          current_streak: number | null
          favorite_time_of_day: number | null
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          total_points: number | null
          total_study_time_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          favorite_time_of_day?: number | null
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_points?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          favorite_time_of_day?: number | null
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_points?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: number
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: number
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: number
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_points: {
        Args: { difficulty: number; is_correct: boolean }
        Returns: number
      }
      get_user_quiz_stats: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          role: string
          created_at: string
          updated_at: string
          email: string
          nickname: string
        }[]
      }
      increment_question_stats: {
        Args: { question_id: number; answer_index: number }
        Returns: undefined
      }
      record_question_attempt: {
        Args: {
          p_session_id: string
          p_user_id: string
          p_question_id: number
          p_category: string
          p_subcategory: string
          p_difficulty: number
          p_selected_answer: number
          p_correct_answer: number
          p_response_time_ms: number
        }
        Returns: string
      }
      update_category_performance: {
        Args: {
          target_user_id: string
          target_category: string
          is_correct: boolean
          points_earned: number
          question_difficulty: number
        }
        Returns: undefined
      }
      update_user_engagement: {
        Args: {
          target_user_id: string
          session_points: number
          session_duration_minutes: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
