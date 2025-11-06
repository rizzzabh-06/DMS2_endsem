export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          award_id: number
          award_name: string
          created_at: string | null
          match_id: number | null
          player_id: number | null
        }
        Insert: {
          award_id?: number
          award_name: string
          created_at?: string | null
          match_id?: number | null
          player_id?: number | null
        }
        Update: {
          award_id?: number
          award_name?: string
          created_at?: string | null
          match_id?: number | null
          player_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "awards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "awards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      match_result: {
        Row: {
          margin: number | null
          match_id: number | null
          result_id: number
          winner_team_id: number | null
        }
        Insert: {
          margin?: number | null
          match_id?: number | null
          result_id?: number
          winner_team_id?: number | null
        }
        Update: {
          margin?: number | null
          match_id?: number | null
          result_id?: number
          winner_team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_result_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_result_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      match_scores: {
        Row: {
          match_id: number | null
          score: number
          score_id: number
          team_id: number | null
        }
        Insert: {
          match_id?: number | null
          score: number
          score_id?: number
          team_id?: number | null
        }
        Update: {
          match_id?: number | null
          score?: number
          score_id?: number
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      match_teams: {
        Row: {
          match_id: number
          team_id: number
        }
        Insert: {
          match_id: number
          team_id: number
        }
        Update: {
          match_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_teams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          match_date: string
          match_id: number
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          match_date: string
          match_id?: number
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          match_date?: string
          match_id?: number
          venue?: string | null
        }
        Relationships: []
      }
      performance: {
        Row: {
          catches: number | null
          match_id: number | null
          performance_id: number
          player_id: number | null
          runs: number | null
          wickets: number | null
        }
        Insert: {
          catches?: number | null
          match_id?: number | null
          performance_id?: number
          player_id?: number | null
          runs?: number | null
          wickets?: number | null
        }
        Update: {
          catches?: number | null
          match_id?: number | null
          performance_id?: number
          player_id?: number | null
          runs?: number | null
          wickets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "performance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          dob: string | null
          player_id: number
          player_name: string
          role: string | null
          team_id: number | null
        }
        Insert: {
          created_at?: string | null
          dob?: string | null
          player_id?: number
          player_name: string
          role?: string | null
          team_id?: number | null
        }
        Update: {
          created_at?: string | null
          dob?: string | null
          player_id?: number
          player_name?: string
          role?: string | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      sql_logs: {
        Row: {
          executed_at: string | null
          log_id: number
          operation_type: string | null
          sql_text: string
        }
        Insert: {
          executed_at?: string | null
          log_id?: number
          operation_type?: string | null
          sql_text: string
        }
        Update: {
          executed_at?: string | null
          log_id?: number
          operation_type?: string | null
          sql_text?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          coach: string | null
          country: string | null
          created_at: string | null
          team_id: number
          team_name: string
        }
        Insert: {
          coach?: string | null
          country?: string | null
          created_at?: string | null
          team_id?: number
          team_name: string
        }
        Update: {
          coach?: string | null
          country?: string | null
          created_at?: string | null
          team_id?: number
          team_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      match_performance_summary: {
        Row: {
          catches: number | null
          match_date: string | null
          player_name: string | null
          runs: number | null
          venue: string | null
          wickets: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_total_runs: { Args: { p_player_id: number }; Returns: number }
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
