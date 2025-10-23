﻿export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      ai_modifications_log: {
        Row: {
          ai_cost_estimate: number | null;
          ai_model_used: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          modified_recipe_id: string | null;
          original_recipe_id: string;
          processing_time_ms: number | null;
          user_id: string;
          user_preferences_snapshot: Json;
          was_successful: boolean;
        };
        Insert: {
          ai_cost_estimate?: number | null;
          ai_model_used?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          modified_recipe_id?: string | null;
          original_recipe_id: string;
          processing_time_ms?: number | null;
          user_id: string;
          user_preferences_snapshot: Json;
          was_successful?: boolean;
        };
        Update: {
          ai_cost_estimate?: number | null;
          ai_model_used?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          modified_recipe_id?: string | null;
          original_recipe_id?: string;
          processing_time_ms?: number | null;
          user_id?: string;
          user_preferences_snapshot?: Json;
          was_successful?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "ai_modifications_log_modified_recipe_id_fkey";
            columns: ["modified_recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_modifications_log_original_recipe_id_fkey";
            columns: ["original_recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          allergies: string[];
          avatar_url: string | null;
          created_at: string;
          diets: string[];
          disliked_ingredients: string[];
          full_name: string | null;
          has_completed_onboarding: boolean;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          allergies?: string[];
          avatar_url?: string | null;
          created_at?: string;
          diets?: string[];
          disliked_ingredients?: string[];
          full_name?: string | null;
          has_completed_onboarding?: boolean;
          id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          allergies?: string[];
          avatar_url?: string | null;
          created_at?: string;
          diets?: string[];
          disliked_ingredients?: string[];
          full_name?: string | null;
          has_completed_onboarding?: boolean;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          changes_summary: Json | null;
          created_at: string;
          id: string;
          ingredients: string;
          instructions: string;
          original_recipe_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          changes_summary?: Json | null;
          created_at?: string;
          id?: string;
          ingredients: string;
          instructions: string;
          original_recipe_id?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          changes_summary?: Json | null;
          created_at?: string;
          id?: string;
          ingredients?: string;
          instructions?: string;
          original_recipe_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_original_recipe_id_fkey";
            columns: ["original_recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
