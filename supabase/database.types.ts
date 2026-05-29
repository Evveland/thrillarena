export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          config: Json | null
          created_at: string
          end_date: string
          id: string
          name: string
          raffle_count: number
          start_date: string
          status: string
          total_prize_pool: number
          winners_per_raffle: number
          winners_total: number
        }
        Insert: {
          config?: Json | null
          created_at?: string
          end_date: string
          id: string
          name: string
          raffle_count?: number
          start_date: string
          status?: string
          total_prize_pool: number
          winners_per_raffle?: number
          winners_total?: number
        }
        Update: {
          config?: Json | null
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          raffle_count?: number
          start_date?: string
          status?: string
          total_prize_pool?: number
          winners_per_raffle?: number
          winners_total?: number
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deposit_number: number
          external_reference: string | null
          id: string
          user_id: string
          verified_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deposit_number: number
          external_reference?: string | null
          id?: string
          user_id: string
          verified_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deposit_number?: number
          external_reference?: string | null
          id?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_ledger: {
        Row: {
          action_type: string
          balance_after: number
          created_at: string
          delta: number
          id: string
          notes: string | null
          related_prediction_id: string | null
          related_user_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          balance_after: number
          created_at?: string
          delta: number
          id?: string
          notes?: string | null
          related_prediction_id?: string | null
          related_user_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          balance_after?: number
          created_at?: string
          delta?: number
          id?: string
          notes?: string | null
          related_prediction_id?: string | null
          related_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_ledger_related_prediction_id_fkey"
            columns: ["related_prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_ledger_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team: string
          campaign_id: string | null
          created_at: string
          external_id: string | null
          graded_at: string | null
          group_id: string | null
          home_score: number | null
          home_team: string
          id: string
          locks_at: string
          result_status: string
          scheduled_at: string
          stage: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          campaign_id?: string | null
          created_at?: string
          external_id?: string | null
          graded_at?: string | null
          group_id?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          locks_at: string
          result_status?: string
          scheduled_at: string
          stage: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          campaign_id?: string | null
          created_at?: string
          external_id?: string | null
          graded_at?: string | null
          group_id?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          locks_at?: string
          result_status?: string
          scheduled_at?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "wc_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          energy_cost: number
          graded_at: string | null
          id: string
          is_correct: boolean | null
          locked_at: string | null
          match_id: string
          prediction_value: string
          result_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_cost?: number
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          locked_at?: string | null
          match_id: string
          prediction_value: string
          result_status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_cost?: number
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          locked_at?: string | null
          match_id?: string
          prediction_value?: string
          result_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_winners: {
        Row: {
          effective_tickets_at_draw: number
          id: string
          paid_at: string | null
          prize_amount: number
          raffle_id: string
          seed: string
          selected_at: string
          status: string
          total_pool_tickets_at_draw: number
          user_id: string
        }
        Insert: {
          effective_tickets_at_draw: number
          id?: string
          paid_at?: string | null
          prize_amount: number
          raffle_id: string
          seed: string
          selected_at?: string
          status?: string
          total_pool_tickets_at_draw: number
          user_id: string
        }
        Update: {
          effective_tickets_at_draw?: number
          id?: string
          paid_at?: string | null
          prize_amount?: number
          raffle_id?: string
          seed?: string
          selected_at?: string
          status?: string
          total_pool_tickets_at_draw?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          campaign_id: string
          completed_at: string | null
          created_at: string
          draw_seed: string | null
          entity_key: string
          group_id: string | null
          id: string
          locked_at: string | null
          match_id: string | null
          pool_amount: number
          prize_per_winner: number | null
          raffle_date: string | null
          status: string
          type: string
          winners_count: number
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          draw_seed?: string | null
          entity_key: string
          group_id?: string | null
          id?: string
          locked_at?: string | null
          match_id?: string | null
          pool_amount: number
          prize_per_winner?: number | null
          raffle_date?: string | null
          status?: string
          type: string
          winners_count?: number
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          draw_seed?: string | null
          entity_key?: string
          group_id?: string | null
          id?: string
          locked_at?: string | null
          match_id?: string | null
          pool_amount?: number
          prize_per_winner?: number | null
          raffle_date?: string | null
          status?: string
          type?: string
          winners_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "raffles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "wc_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      thrill_tasks: {
        Row: {
          created_at: string
          external_reference: string | null
          id: string
          status: string
          task_type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          external_reference?: string | null
          id?: string
          status?: string
          task_type: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          external_reference?: string | null
          id?: string
          status?: string
          task_type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thrill_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_ledger: {
        Row: {
          base_tickets: number
          computed_at: string
          created_at: string
          effective_tickets: number | null
          id: string
          multiplier: number
          prediction_id: string | null
          raffle_id: string
          source: string
          user_id: string
        }
        Insert: {
          base_tickets?: number
          computed_at?: string
          created_at?: string
          effective_tickets?: number | null
          id?: string
          multiplier?: number
          prediction_id?: string | null
          raffle_id: string
          source?: string
          user_id: string
        }
        Update: {
          base_tickets?: number
          computed_at?: string
          created_at?: string
          effective_tickets?: number | null
          id?: string
          multiplier?: number
          prediction_id?: string | null
          raffle_id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_ledger_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_ledger_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_boosts: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          multiplier: number
          source_txn_id: string | null
          starts_at: string
          trigger: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          multiplier: number
          source_txn_id?: string | null
          starts_at?: string
          trigger: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          source_txn_id?: string | null
          starts_at?: string
          trigger?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          activated_at: string | null
          created_at: string
          display_name: string | null
          energy_balance: number
          flagged_reason: string | null
          id: string
          is_flagged: boolean
          referred_by: string | null
          telegram_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          display_name?: string | null
          energy_balance?: number
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean
          referred_by?: string | null
          telegram_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          display_name?: string | null
          energy_balance?: number
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean
          referred_by?: string | null
          telegram_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wc_groups: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_raffle_odds: {
        Row: {
          base_tickets: number | null
          effective_tickets: number | null
          entity_key: string | null
          multiplier: number | null
          pool_amount: number | null
          raffle_id: string | null
          raffle_status: string | null
          raffle_type: string | null
          total_raffle_tickets: number | null
          user_id: string | null
          win_probability_pct: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_ledger_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
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
