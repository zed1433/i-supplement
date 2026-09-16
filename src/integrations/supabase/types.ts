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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          country_of_origin: string
          created_at: string
          id: string
          name: string
          website_url: string
        }
        Insert: {
          country_of_origin?: string
          created_at?: string
          id?: string
          name: string
          website_url?: string
        }
        Update: {
          country_of_origin?: string
          created_at?: string
          id?: string
          name?: string
          website_url?: string
        }
        Relationships: []
      }
      campaign_sends: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          error: string
          id: string
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          error?: string
          id?: string
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          error?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          body: string
          created_at: string
          failed_count: number
          id: string
          raw_excerpt: string
          retailer: string
          sent_at: string | null
          sent_count: number
          source: string
          source_date: string | null
          source_from: string
          source_message_id: string | null
          source_subject: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          failed_count?: number
          id?: string
          raw_excerpt?: string
          retailer?: string
          sent_at?: string | null
          sent_count?: number
          source?: string
          source_date?: string | null
          source_from?: string
          source_message_id?: string | null
          source_subject?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          failed_count?: number
          id?: string
          raw_excerpt?: string
          retailer?: string
          sent_at?: string | null
          sent_count?: number
          source?: string
          source_date?: string | null
          source_from?: string
          source_message_id?: string | null
          source_subject?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      cron_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      feed_runs: {
        Row: {
          errors: string[]
          feed_id: string | null
          finished_at: string | null
          id: string
          rows_matched: number
          rows_total: number
          rows_updated: number
          started_at: string
          status: string
          trigger: string
          unmatched: Json
        }
        Insert: {
          errors?: string[]
          feed_id?: string | null
          finished_at?: string | null
          id?: string
          rows_matched?: number
          rows_total?: number
          rows_updated?: number
          started_at?: string
          status?: string
          trigger?: string
          unmatched?: Json
        }
        Update: {
          errors?: string[]
          feed_id?: string | null
          finished_at?: string | null
          id?: string
          rows_matched?: number
          rows_total?: number
          rows_updated?: number
          started_at?: string
          status?: string
          trigger?: string
          unmatched?: Json
        }
        Relationships: [
          {
            foreignKeyName: "feed_runs_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "retailer_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          chemical_form: string
          contraindications: string[]
          created_at: string
          elemental_ratio: number
          id: string
          mechanism_of_action: string
          name: string
          potential_side_effects: string[]
          target_benefits: string[]
          upper_tolerable_limit: string
        }
        Insert: {
          chemical_form: string
          contraindications?: string[]
          created_at?: string
          elemental_ratio?: number
          id?: string
          mechanism_of_action?: string
          name: string
          potential_side_effects?: string[]
          target_benefits?: string[]
          upper_tolerable_limit?: string
        }
        Update: {
          chemical_form?: string
          contraindications?: string[]
          created_at?: string
          elemental_ratio?: number
          id?: string
          mechanism_of_action?: string
          name?: string
          potential_side_effects?: string[]
          target_benefits?: string[]
          upper_tolerable_limit?: string
        }
        Relationships: []
      }
      job_state: {
        Row: {
          failures: number
          job_name: string
          last_run_at: string | null
          last_status: string
          leased_until: string | null
          pause_reason: string
          paused: boolean
          updated_at: string
        }
        Insert: {
          failures?: number
          job_name: string
          last_run_at?: string | null
          last_status?: string
          leased_until?: string | null
          pause_reason?: string
          paused?: boolean
          updated_at?: string
        }
        Update: {
          failures?: number
          job_name?: string
          last_run_at?: string | null
          last_status?: string
          leased_until?: string | null
          pause_reason?: string
          paused?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      merchant_offers: {
        Row: {
          affiliate_network: string
          affiliate_target_url: string
          country_flag: string
          currency: string
          estimated_delivery: string
          id: string
          in_stock: boolean
          link_verified: boolean
          link_verified_at: string | null
          merchant_name: string
          price: number
          product_id: string
          retailer_product_id: string
          shipping_cost: number
          ships_to: string[]
          updated_at: string
        }
        Insert: {
          affiliate_network?: string
          affiliate_target_url?: string
          country_flag?: string
          currency?: string
          estimated_delivery?: string
          id?: string
          in_stock?: boolean
          link_verified?: boolean
          link_verified_at?: string | null
          merchant_name: string
          price?: number
          product_id: string
          retailer_product_id?: string
          shipping_cost?: number
          ships_to?: string[]
          updated_at?: string
        }
        Update: {
          affiliate_network?: string
          affiliate_target_url?: string
          country_flag?: string
          currency?: string
          estimated_delivery?: string
          id?: string
          in_stock?: boolean
          link_verified?: boolean
          link_verified_at?: string | null
          merchant_name?: string
          price?: number
          product_id?: string
          retailer_product_id?: string
          shipping_cost?: number
          ships_to?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          bioavailability_score: string
          elemental_amount_mg: number
          gross_amount_mg: number
          id: string
          ingredient_id: string
          percent_daily_value: number
          product_id: string
        }
        Insert: {
          bioavailability_score?: string
          elemental_amount_mg?: number
          gross_amount_mg?: number
          id?: string
          ingredient_id: string
          percent_daily_value?: number
          product_id: string
        }
        Update: {
          bioavailability_score?: string
          elemental_amount_mg?: number
          gross_amount_mg?: number
          id?: string
          ingredient_id?: string
          percent_daily_value?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          catalog_group: string | null
          category: string
          category_path: string[]
          created_at: string
          excipients: string[]
          form: string
          id: string
          image_source: string
          image_url: string
          name: string
          net_weight_grams: number | null
          pricing_basis: string | null
          primary_benefit: string
          serving_size: string
          serving_weight_grams: number | null
          slug: string
          third_party_certifications: string[]
          total_servings: number | null
          trade_offs: string[]
          verified_advantages: string[]
        }
        Insert: {
          brand_id: string
          catalog_group?: string | null
          category: string
          category_path?: string[]
          created_at?: string
          excipients?: string[]
          form: string
          id?: string
          image_source?: string
          image_url?: string
          name: string
          net_weight_grams?: number | null
          pricing_basis?: string | null
          primary_benefit?: string
          serving_size?: string
          serving_weight_grams?: number | null
          slug: string
          third_party_certifications?: string[]
          total_servings?: number | null
          trade_offs?: string[]
          verified_advantages?: string[]
        }
        Update: {
          brand_id?: string
          catalog_group?: string | null
          category?: string
          category_path?: string[]
          created_at?: string
          excipients?: string[]
          form?: string
          id?: string
          image_source?: string
          image_url?: string
          name?: string
          net_weight_grams?: number | null
          pricing_basis?: string | null
          primary_benefit?: string
          serving_size?: string
          serving_weight_grams?: number | null
          slug?: string
          third_party_certifications?: string[]
          total_servings?: number | null
          trade_offs?: string[]
          verified_advantages?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_feeds: {
        Row: {
          active: boolean
          created_at: string
          feed_url: string
          from_email: string
          id: string
          last_message: string
          last_run_at: string | null
          last_status: string
          mapping: Json
          merchant_name: string
          source_kind: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          feed_url?: string
          from_email?: string
          id?: string
          last_message?: string
          last_run_at?: string | null
          last_status?: string
          mapping?: Json
          merchant_name: string
          source_kind?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          feed_url?: string
          from_email?: string
          id?: string
          last_message?: string
          last_run_at?: string | null
          last_status?: string
          mapping?: Json
          merchant_name?: string
          source_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
          unsubscribe_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      trigger_daily_jobs: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
