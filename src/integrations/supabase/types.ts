export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          type: string;
          updated_at: string;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          type: string;
          updated_at?: string;
          user_id: string;
          value?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          value?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          contact_info: string;
          created_at: string;
          follow_up_date: string | null;
          genre_fit: string;
          id: string;
          last_contacted_at: string | null;
          link: string;
          location: string;
          name: string;
          notes: string;
          sort_order: number;
          stage: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contact_info?: string;
          created_at?: string;
          follow_up_date?: string | null;
          genre_fit?: string;
          id?: string;
          last_contacted_at?: string | null;
          link?: string;
          location?: string;
          name: string;
          notes?: string;
          sort_order?: number;
          stage?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contact_info?: string;
          created_at?: string;
          follow_up_date?: string | null;
          genre_fit?: string;
          id?: string;
          last_contacted_at?: string | null;
          link?: string;
          location?: string;
          name?: string;
          notes?: string;
          sort_order?: number;
          stage?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      outreach_logs: {
        Row: {
          channel: string;
          contacted_at: string;
          created_at: string;
          id: string;
          message_notes: string;
          opportunity_id: string;
          user_id: string;
        };
        Insert: {
          channel: string;
          contacted_at?: string;
          created_at?: string;
          id?: string;
          message_notes?: string;
          opportunity_id: string;
          user_id: string;
        };
        Update: {
          channel?: string;
          contacted_at?: string;
          created_at?: string;
          id?: string;
          message_notes?: string;
          opportunity_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outreach_logs_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
      pitch_templates: {
        Row: {
          body: string;
          category: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string;
          category?: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          category?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          artist_name: string;
          bio: string;
          calendar_reminders: number[];
          calendar_timezone: string;
          calendar_token: string;
          contact_email: string;
          contact_phone: string;
          created_at: string;
          genre: string;
          hero_image_url: string;
          id: string;
          is_public: boolean;
          location: string;
          slug: string;
          updated_at: string;
          user_id: string;
          website: string;
        };
        Insert: {
          artist_name?: string;
          bio?: string;
          calendar_reminders?: number[];
          calendar_timezone?: string;
          calendar_token?: string;
          contact_email?: string;
          contact_phone?: string;
          created_at?: string;
          genre?: string;
          hero_image_url?: string;
          id?: string;
          is_public?: boolean;
          location?: string;
          slug: string;
          updated_at?: string;
          user_id: string;
          website?: string;
        };
        Update: {
          artist_name?: string;
          bio?: string;
          calendar_reminders?: number[];
          calendar_timezone?: string;
          calendar_token?: string;
          contact_email?: string;
          contact_phone?: string;
          created_at?: string;
          genre?: string;
          hero_image_url?: string;
          id?: string;
          is_public?: boolean;
          location?: string;
          slug?: string;
          updated_at?: string;
          user_id?: string;
          website?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
