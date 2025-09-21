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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      archaeological_discoveries: {
        Row: {
          created_at: string
          description: string
          discovery_date: string
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          organization: string | null
          researcher_name: string | null
          significance: string | null
          species_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discovery_date: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          organization?: string | null
          researcher_name?: string | null
          significance?: string | null
          species_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discovery_date?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          organization?: string | null
          researcher_name?: string | null
          significance?: string | null
          species_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archaeological_discoveries_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "dinosaur_species"
            referencedColumns: ["id"]
          },
        ]
      }
      dinosaur_species: {
        Row: {
          created_at: string
          description: string | null
          diet: string | null
          discovered_location: string | null
          discovered_year: number | null
          fun_facts: string[] | null
          habitat: string | null
          id: string
          image_url: string | null
          name: string
          period: string
          scientific_name: string
          size_height: number | null
          size_length: number | null
          size_weight: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          diet?: string | null
          discovered_location?: string | null
          discovered_year?: number | null
          fun_facts?: string[] | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          name: string
          period: string
          scientific_name: string
          size_height?: number | null
          size_length?: number | null
          size_weight?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          diet?: string | null
          discovered_location?: string | null
          discovered_year?: number | null
          fun_facts?: string[] | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          name?: string
          period?: string
          scientific_name?: string
          size_height?: number | null
          size_length?: number | null
          size_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dinosaur_species2: {
        Row: {
          behavior_notes: string | null
          common_name: string | null
          diet: string | null
          first_discovered: string | null
          fossil_location: string | null
          geological_period: string | null
          height_m: number | null
          intelligence_level: string | null
          length_m: number | null
          lived_in: string | null
          locomotion: string | null
          meaning: string | null
          notable_features: string | null
          row_index: string
          scientific_name: string | null
          source_link: string | null
          weight_kg: number | null
        }
        Insert: {
          behavior_notes?: string | null
          common_name?: string | null
          diet?: string | null
          first_discovered?: string | null
          fossil_location?: string | null
          geological_period?: string | null
          height_m?: number | null
          intelligence_level?: string | null
          length_m?: number | null
          lived_in?: string | null
          locomotion?: string | null
          meaning?: string | null
          notable_features?: string | null
          row_index: string
          scientific_name?: string | null
          source_link?: string | null
          weight_kg?: number | null
        }
        Update: {
          behavior_notes?: string | null
          common_name?: string | null
          diet?: string | null
          first_discovered?: string | null
          fossil_location?: string | null
          geological_period?: string | null
          height_m?: number | null
          intelligence_level?: string | null
          length_m?: number | null
          lived_in?: string | null
          locomotion?: string | null
          meaning?: string | null
          notable_features?: string | null
          row_index?: string
          scientific_name?: string | null
          source_link?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          organization: string | null
          quiz_scores: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          quiz_scores?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          quiz_scores?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          question: string
          species_id: string | null
          wrong_answers: string[]
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty: string
          explanation?: string | null
          id?: string
          question: string
          species_id?: string | null
          wrong_answers: string[]
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          question?: string
          species_id?: string | null
          wrong_answers?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "dinosaur_species"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
