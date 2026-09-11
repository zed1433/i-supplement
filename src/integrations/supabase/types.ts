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
      merchant_offers: {
        Row: {
          affiliate_network: string
          affiliate_target_url: string
          country_flag: string
          currency: string
          estimated_delivery: string
          id: string
          in_stock: boolean
          merchant_name: string
          price: number
          product_id: string
          shipping_cost: number
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
          merchant_name: string
          price?: number
          product_id: string
          shipping_cost?: number
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
          merchant_name?: string
          price?: number
          product_id?: string
          shipping_cost?: number
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
          category: string
          created_at: string
          excipients: string[]
          form: string
          id: string
          name: string
          primary_benefit: string
          serving_size: string
          slug: string
          third_party_certifications: string[]
          trade_offs: string[]
          verified_advantages: string[]
        }
        Insert: {
          brand_id: string
          category: string
          created_at?: string
          excipients?: string[]
          form: string
          id?: string
          name: string
          primary_benefit?: string
          serving_size?: string
          slug: string
          third_party_certifications?: string[]
          trade_offs?: string[]
          verified_advantages?: string[]
        }
        Update: {
          brand_id?: string
          category?: string
          created_at?: string
          excipients?: string[]
          form?: string
          id?: string
          name?: string
          primary_benefit?: string
          serving_size?: string
          slug?: string
          third_party_certifications?: string[]
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
    Enums: {},
  },
} as const
