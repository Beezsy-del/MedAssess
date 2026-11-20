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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json
          entity_id: string | null
          hospital_id: string
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          hospital_id: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          hospital_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          capacity: number
          hospital_id: string
          id: string
          location: string
          name: string
        }
        Insert: {
          capacity?: number
          hospital_id: string
          id?: string
          location?: string
          name: string
        }
        Update: {
          capacity?: number
          hospital_id?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_access_tokens: {
        Row: {
          encounter_id: string
          expires_at: string
          hospital_id: string
          id: string
          revoked_at: string | null
          submitted_at: string | null
          token_hash: string
        }
        Insert: {
          encounter_id: string
          expires_at?: string
          hospital_id: string
          id?: string
          revoked_at?: string | null
          submitted_at?: string | null
          token_hash: string
        }
        Update: {
          encounter_id?: string
          expires_at?: string
          hospital_id?: string
          id?: string
          revoked_at?: string | null
          submitted_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_access_tokens_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "encounter_access_tokens_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_memberships: {
        Row: {
          active: boolean
          display_name: string
          hospital_id: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          active?: boolean
          display_name: string
          hospital_id: string
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          active?: boolean
          display_name?: string
          hospital_id?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_memberships_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_resources: {
        Row: {
          department_id: string | null
          hospital_id: string
          id: string
          kind: string
          location: string
          name: string
          status: string
        }
        Insert: {
          department_id?: string | null
          hospital_id: string
          id?: string
          kind: string
          location?: string
          name: string
          status?: string
        }
        Update: {
          department_id?: string | null
          hospital_id?: string
          id?: string
          kind?: string
          location?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_resources_department_id_hospital_id_fkey"
            columns: ["department_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "hospital_resources_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_settings: {
        Row: {
          alert_minutes: number
          clinical_enabled: boolean
          hospital_id: string
          id: string
          languages: string[]
          reassessment_minutes: number
        }
        Insert: {
          alert_minutes?: number
          clinical_enabled?: boolean
          hospital_id: string
          id?: string
          languages?: string[]
          reassessment_minutes?: number
        }
        Update: {
          alert_minutes?: number
          clinical_enabled?: boolean
          hospital_id?: string
          id?: string
          languages?: string[]
          reassessment_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "hospital_settings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: true
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          location: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          recipient_roles: Database["public"]["Enums"]["staff_role"][]
          resolution: string | null
          resolved_at: string | null
          status: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          recipient_roles: Database["public"]["Enums"]["staff_role"][]
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          recipient_roles?: Database["public"]["Enums"]["staff_role"][]
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "notifications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_events: {
        Row: {
          actor: string
          created_at: string
          encounter_id: string | null
          hospital_id: string
          id: string
          operation_id: string
        }
        Insert: {
          actor: string
          created_at?: string
          encounter_id?: string | null
          hospital_id: string
          id?: string
          operation_id: string
        }
        Update: {
          actor?: string
          created_at?: string
          encounter_id?: string | null
          hospital_id?: string
          id?: string
          operation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_sync_events_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_encounters: {
        Row: {
          arrived_at: string
          assigned_to: string | null
          category: Database["public"]["Enums"]["triage_category"]
          created_by: string | null
          department_id: string | null
          deteriorating: boolean
          emergency: boolean
          hospital_id: string
          id: string
          idempotency_key: string
          intake: Json
          patient_id: string
          reassessment_due: string | null
          reference: string
          score: number | null
          status: string
          sub_priority: number
          symptoms: string
          updated_at: string
          version: number
        }
        Insert: {
          arrived_at?: string
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["triage_category"]
          created_by?: string | null
          department_id?: string | null
          deteriorating?: boolean
          emergency?: boolean
          hospital_id: string
          id?: string
          idempotency_key: string
          intake?: Json
          patient_id: string
          reassessment_due?: string | null
          reference?: string
          score?: number | null
          status?: string
          sub_priority?: number
          symptoms?: string
          updated_at?: string
          version?: number
        }
        Update: {
          arrived_at?: string
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["triage_category"]
          created_by?: string | null
          department_id?: string | null
          deteriorating?: boolean
          emergency?: boolean
          hospital_id?: string
          id?: string
          idempotency_key?: string
          intake?: Json
          patient_id?: string
          reassessment_due?: string | null
          reference?: string
          score?: number | null
          status?: string
          sub_priority?: number
          symptoms?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_encounters_department_id_hospital_id_fkey"
            columns: ["department_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "patient_encounters_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_encounters_patient_id_hospital_id_fkey"
            columns: ["patient_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id", "hospital_id"]
          },
        ]
      }
      patient_status_events: {
        Row: {
          actor: string | null
          created_at: string
          encounter_id: string
          from_status: string | null
          hospital_id: string
          id: string
          reason: string
          to_status: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          encounter_id: string
          from_status?: string | null
          hospital_id: string
          id?: string
          reason: string
          to_status: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          encounter_id?: string
          from_status?: string | null
          hospital_id?: string
          id?: string
          reason?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_status_events_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "patient_status_events_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          created_at: string
          hospital_id: string
          id: string
          name: string
          phone: string | null
          sex: string | null
          unidentified: boolean
        }
        Insert: {
          age?: number | null
          created_at?: string
          hospital_id: string
          id?: string
          name: string
          phone?: string | null
          sex?: string | null
          unidentified?: boolean
        }
        Update: {
          age?: number | null
          created_at?: string
          hospital_id?: string
          id?: string
          name?: string
          phone?: string | null
          sex?: string | null
          unidentified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_facilities: {
        Row: {
          availability_note: string
          contact: string
          hospital_id: string
          id: string
          name: string
          services: string
        }
        Insert: {
          availability_note?: string
          contact: string
          hospital_id: string
          id?: string
          name: string
          services: string
        }
        Update: {
          availability_note?: string
          contact?: string
          hospital_id?: string
          id?: string
          name?: string
          services?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_facilities_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          acknowledgement: string | null
          created_at: string
          doctor_id: string
          encounter_id: string
          facility_id: string
          hospital_id: string
          id: string
          reason: string
          status: string
          summary: string
          transport: string
          updated_at: string
        }
        Insert: {
          acknowledgement?: string | null
          created_at?: string
          doctor_id: string
          encounter_id: string
          facility_id: string
          hospital_id: string
          id?: string
          reason: string
          status?: string
          summary: string
          transport: string
          updated_at?: string
        }
        Update: {
          acknowledgement?: string | null
          created_at?: string
          doctor_id?: string
          encounter_id?: string
          facility_id?: string
          hospital_id?: string
          id?: string
          reason?: string
          status?: string
          summary?: string
          transport?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "referrals_facility_id_hospital_id_fkey"
            columns: ["facility_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "referral_facilities"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "referrals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_reservations: {
        Row: {
          actor: string
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          released_at: string | null
          resource_id: string
        }
        Insert: {
          actor: string
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          released_at?: string | null
          resource_id: string
        }
        Update: {
          actor?: string
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          released_at?: string | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_reservations_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "resource_reservations_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_reservations_resource_id_hospital_id_fkey"
            columns: ["resource_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_resources"
            referencedColumns: ["id", "hospital_id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          ends_at: string
          hospital_id: string
          id: string
          starts_at: string
          user_id: string
        }
        Insert: {
          ends_at: string
          hospital_id: string
          id?: string
          starts_at: string
          user_id: string
        }
        Update: {
          ends_at?: string
          hospital_id?: string
          id?: string
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_records: {
        Row: {
          actor: string
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          kind: string
          note: string
        }
        Insert: {
          actor: string
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          kind: string
          note: string
        }
        Update: {
          actor?: string
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          kind?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_records_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "treatment_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_assessments: {
        Row: {
          actor: string
          confirmed_category: Database["public"]["Enums"]["triage_category"]
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          input: Json
          proposed_category: Database["public"]["Enums"]["triage_category"]
          protocol: string
          reason: string
          result: Json
        }
        Insert: {
          actor: string
          confirmed_category: Database["public"]["Enums"]["triage_category"]
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          input: Json
          proposed_category: Database["public"]["Enums"]["triage_category"]
          protocol?: string
          reason: string
          result: Json
        }
        Update: {
          actor?: string
          confirmed_category?: Database["public"]["Enums"]["triage_category"]
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          input?: Json
          proposed_category?: Database["public"]["Enums"]["triage_category"]
          protocol?: string
          reason?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "triage_assessments_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "triage_assessments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_protocol_versions: {
        Row: {
          approved_at: string | null
          configuration: Json
          effective_at: string | null
          hospital_id: string
          id: string
          name: string
          reference: string | null
          reviewer: string | null
          status: string
          version: string
        }
        Insert: {
          approved_at?: string | null
          configuration?: Json
          effective_at?: string | null
          hospital_id: string
          id?: string
          name: string
          reference?: string | null
          reviewer?: string | null
          status?: string
          version: string
        }
        Update: {
          approved_at?: string | null
          configuration?: Json
          effective_at?: string | null
          hospital_id?: string
          id?: string
          name?: string
          reference?: string | null
          reviewer?: string | null
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_protocol_versions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          actor: string
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          pulse: number | null
          respiratory_rate: number | null
          spo2: number | null
          systolic: number | null
          temperature: number | null
        }
        Insert: {
          actor: string
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          pulse?: number | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic?: number | null
          temperature?: number | null
        }
        Update: {
          actor?: string
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          pulse?: number | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_encounter_id_hospital_id_fkey"
            columns: ["encounter_id", "hospital_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id", "hospital_id"]
          },
          {
            foreignKeyName: "vital_signs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_demo_tests: { Args: { p_hospital: string }; Returns: number }
      escalate_alerts: { Args: { p_hospital: string }; Returns: number }
      patient_portal: {
        Args: { p_action: string; p_data?: Json; p_token: string }
        Returns: Json
      }
      staff_command: {
        Args: { p_action: string; p_data: Json; p_hospital: string }
        Returns: Json
      }
    }
    Enums: {
      staff_role:
        | "super_admin"
        | "hospital_admin"
        | "receptionist"
        | "triage_nurse"
        | "nurse"
        | "doctor"
        | "emergency_coordinator"
        | "resource_manager"
      triage_category: "RED" | "YELLOW" | "GREEN" | "ASSESSMENT_REQUIRED"
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
      staff_role: [
        "super_admin",
        "hospital_admin",
        "receptionist",
        "triage_nurse",
        "nurse",
        "doctor",
        "emergency_coordinator",
        "resource_manager",
      ],
      triage_category: ["RED", "YELLOW", "GREEN", "ASSESSMENT_REQUIRED"],
    },
  },
} as const

