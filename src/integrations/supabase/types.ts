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
      evento_seguidores: {
        Row: {
          group_code: number
          group_name: string | null
          ultimo_evento: string | null
        }
        Insert: {
          group_code: number
          group_name?: string | null
          ultimo_evento?: string | null
        }
        Update: {
          group_code?: number
          group_name?: string | null
          ultimo_evento?: string | null
        }
        Relationships: []
      }
      franqueados: {
        Row: {
          address: string | null
          availability: string | null
          birth_date: string | null
          confidentiality_term_accepted: boolean
          contact: string
          cpf_rnm: string | null
          created_at: string | null
          discovery_source: string | null
          education: string | null
          full_name: string
          has_other_activities: boolean | null
          id: string
          is_in_contract: boolean | null
          lgpd_term_accepted: boolean
          nationality: string | null
          other_activities_description: string | null
          owner_type: string
          previous_profession: string | null
          previous_salary_range: string | null
          profile_image: string | null
          prolabore_value: number | null
          receives_prolabore: boolean | null
          referrer_name: string | null
          referrer_unit_code: string | null
          system_term_accepted: boolean
          updated_at: string | null
          was_entrepreneur: boolean | null
          was_referred: boolean | null
          web_password: string
        }
        Insert: {
          address?: string | null
          availability?: string | null
          birth_date?: string | null
          confidentiality_term_accepted?: boolean
          contact: string
          cpf_rnm?: string | null
          created_at?: string | null
          discovery_source?: string | null
          education?: string | null
          full_name: string
          has_other_activities?: boolean | null
          id?: string
          is_in_contract?: boolean | null
          lgpd_term_accepted?: boolean
          nationality?: string | null
          other_activities_description?: string | null
          owner_type: string
          previous_profession?: string | null
          previous_salary_range?: string | null
          profile_image?: string | null
          prolabore_value?: number | null
          receives_prolabore?: boolean | null
          referrer_name?: string | null
          referrer_unit_code?: string | null
          system_term_accepted?: boolean
          updated_at?: string | null
          was_entrepreneur?: boolean | null
          was_referred?: boolean | null
          web_password: string
        }
        Update: {
          address?: string | null
          availability?: string | null
          birth_date?: string | null
          confidentiality_term_accepted?: boolean
          contact?: string
          cpf_rnm?: string | null
          created_at?: string | null
          discovery_source?: string | null
          education?: string | null
          full_name?: string
          has_other_activities?: boolean | null
          id?: string
          is_in_contract?: boolean | null
          lgpd_term_accepted?: boolean
          nationality?: string | null
          other_activities_description?: string | null
          owner_type?: string
          previous_profession?: string | null
          previous_salary_range?: string | null
          profile_image?: string | null
          prolabore_value?: number | null
          receives_prolabore?: boolean | null
          referrer_name?: string | null
          referrer_unit_code?: string | null
          system_term_accepted?: boolean
          updated_at?: string | null
          was_entrepreneur?: boolean | null
          was_referred?: boolean | null
          web_password?: string
        }
        Relationships: []
      }
      franqueados_unidades: {
        Row: {
          created_at: string
          franqueado_id: string
          id: number
          unidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          franqueado_id: string
          id?: never
          unidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          franqueado_id?: string
          id?: never
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franqueados_unidades_franqueado_id_fkey"
            columns: ["franqueado_id"]
            isOneToOne: false
            referencedRelation: "franqueados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franqueados_unidades_franqueado_id_fkey"
            columns: ["franqueado_id"]
            isOneToOne: false
            referencedRelation: "v_franqueados_com_unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franqueados_unidades_franqueado_id_fkey"
            columns: ["franqueado_id"]
            isOneToOne: false
            referencedRelation: "v_franqueados_unidades_detalhes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franqueados_unidades_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          address: string | null
          address_complement: string | null
          ai_agent_id: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          docs_folder_id: string | null
          docs_folder_link: string | null
          drive_folder_id: string | null
          drive_folder_link: string | null
          email: string | null
          group_code: number
          group_name: string
          has_parking: boolean | null
          has_partner_parking: boolean | null
          id: string
          instagram_profile: string | null
          neighborhood: string | null
          notion_page_id: string | null
          number_address: string | null
          operation_fri: string | null
          operation_hol: string | null
          operation_mon: string | null
          operation_sat: string | null
          operation_sun: string | null
          operation_thu: string | null
          operation_tue: string | null
          operation_wed: string | null
          parking_spots: number | null
          partner_parking_address: string | null
          phone: string | null
          postal_code: string | null
          purchases_active: boolean | null
          sales_active: boolean | null
          state: string | null
          store_imp_phase: string
          store_model: string
          store_phase: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          ai_agent_id?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          docs_folder_id?: string | null
          docs_folder_link?: string | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          email?: string | null
          group_code?: number
          group_name: string
          has_parking?: boolean | null
          has_partner_parking?: boolean | null
          id?: string
          instagram_profile?: string | null
          neighborhood?: string | null
          notion_page_id?: string | null
          number_address?: string | null
          operation_fri?: string | null
          operation_hol?: string | null
          operation_mon?: string | null
          operation_sat?: string | null
          operation_sun?: string | null
          operation_thu?: string | null
          operation_tue?: string | null
          operation_wed?: string | null
          parking_spots?: number | null
          partner_parking_address?: string | null
          phone?: string | null
          postal_code?: string | null
          purchases_active?: boolean | null
          sales_active?: boolean | null
          state?: string | null
          store_imp_phase: string
          store_model: string
          store_phase?: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          ai_agent_id?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          docs_folder_id?: string | null
          docs_folder_link?: string | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          email?: string | null
          group_code?: number
          group_name?: string
          has_parking?: boolean | null
          has_partner_parking?: boolean | null
          id?: string
          instagram_profile?: string | null
          neighborhood?: string | null
          notion_page_id?: string | null
          number_address?: string | null
          operation_fri?: string | null
          operation_hol?: string | null
          operation_mon?: string | null
          operation_sat?: string | null
          operation_sun?: string | null
          operation_thu?: string | null
          operation_tue?: string | null
          operation_wed?: string | null
          parking_spots?: number | null
          partner_parking_address?: string | null
          phone?: string | null
          postal_code?: string | null
          purchases_active?: boolean | null
          sales_active?: boolean | null
          state?: string | null
          store_imp_phase?: string
          store_model?: string
          store_phase?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unidades_grupos_whatsapp: {
        Row: {
          created_at: string
          group_id: string
          id: string
          kind: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          kind: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["whatsapp_group_kind_enum"]
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_grupos_whatsapp_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_franqueados_com_unidades: {
        Row: {
          address: string | null
          availability: string | null
          birth_date: string | null
          confidentiality_term_accepted: boolean | null
          contact: string | null
          cpf_rnm: string | null
          created_at: string | null
          discovery_source: string | null
          education: string | null
          full_name: string | null
          has_other_activities: boolean | null
          id: string | null
          is_in_contract: boolean | null
          lgpd_term_accepted: boolean | null
          nationality: string | null
          other_activities_description: string | null
          owner_type: string | null
          previous_profession: string | null
          previous_salary_range: string | null
          profile_image: string | null
          prolabore_value: number | null
          receives_prolabore: boolean | null
          referrer_name: string | null
          referrer_unit_code: string | null
          system_term_accepted: boolean | null
          total_unidades: number | null
          unidade_ids: string[] | null
          updated_at: string | null
          was_entrepreneur: boolean | null
          was_referred: boolean | null
          web_password: string | null
        }
        Relationships: []
      }
      v_franqueados_unidades_detalhes: {
        Row: {
          address: string | null
          availability: string | null
          birth_date: string | null
          confidentiality_term_accepted: boolean | null
          contact: string | null
          cpf_rnm: string | null
          created_at: string | null
          discovery_source: string | null
          education: string | null
          full_name: string | null
          has_other_activities: boolean | null
          id: string | null
          is_in_contract: boolean | null
          lgpd_term_accepted: boolean | null
          nationality: string | null
          other_activities_description: string | null
          owner_type: string | null
          previous_profession: string | null
          previous_salary_range: string | null
          profile_image: string | null
          prolabore_value: number | null
          receives_prolabore: boolean | null
          referrer_name: string | null
          referrer_unit_code: string | null
          system_term_accepted: boolean | null
          total_unidades: number | null
          unidade_group_codes: number[] | null
          unidade_group_names: string[] | null
          unidade_ids: string[] | null
          updated_at: string | null
          was_entrepreneur: boolean | null
          was_referred: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      store_imp_phase_enum:
        | "integracao"
        | "treinamento"
        | "procura_de_ponto"
        | "estruturacao"
        | "compras"
        | "inauguracao"
      store_model_enum:
        | "junior"
        | "light"
        | "padrao"
        | "intermediaria"
        | "mega_store"
        | "pontinha"
      store_phase_enum: "implantacao" | "operacao"
      whatsapp_group_kind_enum:
        | "main"
        | "ai"
        | "intensive_support"
        | "colab"
        | "complaining"
        | "notifications"
        | "purchasing_phase"
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
    Enums: {
      store_imp_phase_enum: [
        "integracao",
        "treinamento",
        "procura_de_ponto",
        "estruturacao",
        "compras",
        "inauguracao",
      ],
      store_model_enum: [
        "junior",
        "light",
        "padrao",
        "intermediaria",
        "mega_store",
        "pontinha",
      ],
      store_phase_enum: ["implantacao", "operacao"],
      whatsapp_group_kind_enum: [
        "main",
        "ai",
        "intensive_support",
        "colab",
        "complaining",
        "notifications",
        "purchasing_phase",
      ],
    },
  },
} as const
