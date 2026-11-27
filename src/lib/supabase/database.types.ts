export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admissions: {
        Row: {
          actor: string | null;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          note: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          note: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          note?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admissions_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "admissions_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor: string | null;
          created_at: string;
          details: NonNullable<Json>;
          entity_id: string | null;
          hospital_id: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          entity_id?: string | null;
          hospital_id: string;
          id?: string;
        };
        Update: {
          action?: string;
          actor?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          entity_id?: string | null;
          hospital_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      bed_allocation_events: {
        Row: {
          action: string;
          actor: string | null;
          created_at: string;
          details: NonNullable<Json>;
          encounter_id: string | null;
          hospital_id: string;
          id: string;
          resource_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          encounter_id?: string | null;
          hospital_id: string;
          id?: string;
          resource_id?: string | null;
        };
        Update: {
          action?: string;
          actor?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          encounter_id?: string | null;
          hospital_id?: string;
          id?: string;
          resource_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bed_allocation_events_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "bed_allocation_events_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_allocation_events_resource_id_hospital_id_fkey";
            columns: ["resource_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospital_resources";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      bed_placement_plans: {
        Row: {
          actor: string;
          bed_kind: string | null;
          decision: string;
          encounter_id: string;
          encounter_version: number;
          hospital_id: string;
          reason: string;
          required_capabilities: string[];
          reviewed_at: string;
          ward_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          bed_kind?: string | null;
          decision: string;
          encounter_id: string;
          encounter_version: number;
          hospital_id: string;
          reason: string;
          required_capabilities?: string[];
          reviewed_at?: string;
          ward_id?: string | null;
        };
        Update: {
          actor?: string;
          bed_kind?: string | null;
          decision?: string;
          encounter_id?: string;
          encounter_version?: number;
          hospital_id?: string;
          reason?: string;
          required_capabilities?: string[];
          reviewed_at?: string;
          ward_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bed_placement_plans_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "bed_placement_plans_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_placement_plans_ward_id_hospital_id_fkey";
            columns: ["ward_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "bed_wards";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      bed_profiles: {
        Row: {
          capabilities: string[];
          column_number: number;
          hospital_id: string;
          resource_id: string;
          restrictions: string;
          row_number: number;
          verified: boolean;
          ward_id: string;
        };
        ComputedFields: never;
        Insert: {
          capabilities?: string[];
          column_number: number;
          hospital_id: string;
          resource_id: string;
          restrictions?: string;
          row_number: number;
          verified?: boolean;
          ward_id: string;
        };
        Update: {
          capabilities?: string[];
          column_number?: number;
          hospital_id?: string;
          resource_id?: string;
          restrictions?: string;
          row_number?: number;
          verified?: boolean;
          ward_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bed_profiles_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_profiles_resource_id_hospital_id_fkey";
            columns: ["resource_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospital_resources";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "bed_profiles_ward_id_hospital_id_fkey";
            columns: ["ward_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "bed_wards";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      bed_wards: {
        Row: {
          categories: Database["public"]["Enums"]["triage_category"][];
          department_id: string;
          display_order: number;
          hospital_id: string;
          id: string;
          name: string;
          zone: string;
        };
        ComputedFields: never;
        Insert: {
          categories?: Database["public"]["Enums"]["triage_category"][];
          department_id: string;
          display_order?: number;
          hospital_id: string;
          id?: string;
          name: string;
          zone: string;
        };
        Update: {
          categories?: Database["public"]["Enums"]["triage_category"][];
          department_id?: string;
          display_order?: number;
          hospital_id?: string;
          id?: string;
          name?: string;
          zone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bed_wards_department_id_hospital_id_fkey";
            columns: ["department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "bed_wards_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      department_referral_events: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          reason: string;
          referral_id: string;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          reason: string;
          referral_id: string;
          status: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          reason?: string;
          referral_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "department_referral_events_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "department_referral_events_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "department_referral_events_referral_id_hospital_id_fkey";
            columns: ["referral_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "department_referrals";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      department_referrals: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          created_at: string;
          encounter_id: string;
          from_department_id: string | null;
          hospital_id: string;
          id: string;
          kind: string;
          observations: string;
          reason: string;
          requested_by: string;
          status: string;
          to_department_id: string;
          updated_at: string;
          urgency: Database["public"]["Enums"]["triage_category"];
          version: number;
        };
        ComputedFields: never;
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          encounter_id: string;
          from_department_id?: string | null;
          hospital_id: string;
          id?: string;
          kind: string;
          observations?: string;
          reason: string;
          requested_by: string;
          status?: string;
          to_department_id: string;
          updated_at?: string;
          urgency: Database["public"]["Enums"]["triage_category"];
          version?: number;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          encounter_id?: string;
          from_department_id?: string | null;
          hospital_id?: string;
          id?: string;
          kind?: string;
          observations?: string;
          reason?: string;
          requested_by?: string;
          status?: string;
          to_department_id?: string;
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["triage_category"];
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "department_referrals_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "department_referrals_from_department_id_hospital_id_fkey";
            columns: ["from_department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "department_referrals_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "department_referrals_to_department_id_hospital_id_fkey";
            columns: ["to_department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      departments: {
        Row: {
          accepted_categories: Database["public"]["Enums"]["triage_category"][];
          capacity: number;
          hospital_id: string;
          id: string;
          location: string;
          name: string;
          outpatient: boolean;
          routing_reviewed_at: string | null;
          routing_reviewed_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          accepted_categories?: Database["public"]["Enums"]["triage_category"][];
          capacity?: number;
          hospital_id: string;
          id?: string;
          location?: string;
          name: string;
          outpatient?: boolean;
          routing_reviewed_at?: string | null;
          routing_reviewed_by?: string | null;
        };
        Update: {
          accepted_categories?: Database["public"]["Enums"]["triage_category"][];
          capacity?: number;
          hospital_id?: string;
          id?: string;
          location?: string;
          name?: string;
          outpatient?: boolean;
          routing_reviewed_at?: string | null;
          routing_reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "departments_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      discharges: {
        Row: {
          actor: string | null;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          instructions: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          instructions: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          instructions?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discharges_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "discharges_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      encounter_access_tokens: {
        Row: {
          encounter_id: string;
          expires_at: string;
          hospital_id: string;
          id: string;
          manual_token_hash: string | null;
          revoked_at: string | null;
          submitted_at: string | null;
          token_hash: string;
        };
        ComputedFields: never;
        Insert: {
          encounter_id: string;
          expires_at?: string;
          hospital_id: string;
          id?: string;
          manual_token_hash?: string | null;
          revoked_at?: string | null;
          submitted_at?: string | null;
          token_hash: string;
        };
        Update: {
          encounter_id?: string;
          expires_at?: string;
          hospital_id?: string;
          id?: string;
          manual_token_hash?: string | null;
          revoked_at?: string | null;
          submitted_at?: string | null;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "encounter_access_tokens_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "encounter_access_tokens_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_up_records: {
        Row: {
          actor: string;
          created_at: string;
          due_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          instructions: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          due_at: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          instructions: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          due_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          instructions?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_up_records_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "follow_up_records_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_activity: {
        Row: {
          hospital_id: string;
          updated_at: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          hospital_id: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          hospital_id?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_activity_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: true;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_memberships: {
        Row: {
          active: boolean;
          display_name: string;
          hospital_id: string;
          id: string;
          role: Database["public"]["Enums"]["staff_role"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          display_name: string;
          hospital_id: string;
          id?: string;
          role: Database["public"]["Enums"]["staff_role"];
          user_id: string;
        };
        Update: {
          active?: boolean;
          display_name?: string;
          hospital_id?: string;
          id?: string;
          role?: Database["public"]["Enums"]["staff_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_memberships_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_resources: {
        Row: {
          department_id: string | null;
          hospital_id: string;
          id: string;
          kind: string;
          location: string;
          name: string;
          status: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          department_id?: string | null;
          hospital_id: string;
          id?: string;
          kind: string;
          location?: string;
          name: string;
          status?: string;
          version?: number;
        };
        Update: {
          department_id?: string | null;
          hospital_id?: string;
          id?: string;
          kind?: string;
          location?: string;
          name?: string;
          status?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_resources_department_id_hospital_id_fkey";
            columns: ["department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "hospital_resources_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_settings: {
        Row: {
          alert_minutes: number;
          clinical_enabled: boolean;
          hospital_id: string;
          id: string;
          languages: string[];
          reassessment_minutes: number;
        };
        ComputedFields: never;
        Insert: {
          alert_minutes?: number;
          clinical_enabled?: boolean;
          hospital_id: string;
          id?: string;
          languages?: string[];
          reassessment_minutes?: number;
        };
        Update: {
          alert_minutes?: number;
          clinical_enabled?: boolean;
          hospital_id?: string;
          id?: string;
          languages?: string[];
          reassessment_minutes?: number;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_settings_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: true;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospitals: {
        Row: {
          created_at: string;
          id: string;
          is_demo: boolean;
          location: string;
          name: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_demo?: boolean;
          location: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_demo?: boolean;
          location?: string;
          name?: string;
        };
        Relationships: [];
      };
      investigation_records: {
        Row: {
          actor: string | null;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          note: string;
          treatment_record_id: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          note: string;
          treatment_record_id: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          note?: string;
          treatment_record_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investigation_records_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "investigation_records_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investigation_records_treatment_record_id_fkey";
            columns: ["treatment_record_id"];
            isOneToOne: true;
            referencedRelation: "treatment_records";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_acknowledgements: {
        Row: {
          actor: string | null;
          created_at: string;
          hospital_id: string;
          id: string;
          notification_id: string;
          reason: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          hospital_id: string;
          id?: string;
          notification_id: string;
          reason?: string | null;
          status: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          hospital_id?: string;
          id?: string;
          notification_id?: string;
          reason?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_acknowledgements_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_acknowledgements_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          created_at: string;
          department_id: string | null;
          encounter_id: string;
          hospital_id: string;
          id: string;
          recipient_roles: Database["public"]["Enums"]["staff_role"][];
          recipient_user_id: string | null;
          resolution: string | null;
          resolved_at: string | null;
          status: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          department_id?: string | null;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          recipient_roles: Database["public"]["Enums"]["staff_role"][];
          recipient_user_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: string;
          title: string;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          department_id?: string | null;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          recipient_roles?: Database["public"]["Enums"]["staff_role"][];
          recipient_user_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_department_tenant";
            columns: ["department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "notifications_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "notifications_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      offline_sync_events: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string | null;
          hospital_id: string;
          id: string;
          operation_id: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id?: string | null;
          hospital_id: string;
          id?: string;
          operation_id: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string | null;
          hospital_id?: string;
          id?: string;
          operation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offline_sync_events_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_encounters: {
        Row: {
          arrived_at: string;
          assigned_to: string | null;
          category: Database["public"]["Enums"]["triage_category"];
          created_by: string | null;
          department_id: string | null;
          deteriorating: boolean;
          emergency: boolean;
          hospital_id: string;
          id: string;
          idempotency_key: string;
          intake: NonNullable<Json>;
          latest_patient_report: string | null;
          patient_id: string;
          preliminary_category: Database["public"]["Enums"]["triage_category"];
          reassessment_due: string | null;
          reference: string;
          score: number | null;
          status: string;
          sub_priority: number;
          symptoms: string;
          updated_at: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          arrived_at?: string;
          assigned_to?: string | null;
          category?: Database["public"]["Enums"]["triage_category"];
          created_by?: string | null;
          department_id?: string | null;
          deteriorating?: boolean;
          emergency?: boolean;
          hospital_id: string;
          id?: string;
          idempotency_key: string;
          intake?: NonNullable<Json>;
          latest_patient_report?: string | null;
          patient_id: string;
          preliminary_category?: Database["public"]["Enums"]["triage_category"];
          reassessment_due?: string | null;
          reference?: string;
          score?: number | null;
          status?: string;
          sub_priority?: number;
          symptoms?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          arrived_at?: string;
          assigned_to?: string | null;
          category?: Database["public"]["Enums"]["triage_category"];
          created_by?: string | null;
          department_id?: string | null;
          deteriorating?: boolean;
          emergency?: boolean;
          hospital_id?: string;
          id?: string;
          idempotency_key?: string;
          intake?: NonNullable<Json>;
          latest_patient_report?: string | null;
          patient_id?: string;
          preliminary_category?: Database["public"]["Enums"]["triage_category"];
          reassessment_due?: string | null;
          reference?: string;
          score?: number | null;
          status?: string;
          sub_priority?: number;
          symptoms?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "latest_report_tenant";
            columns: ["latest_patient_report", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_allergies";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "latest_report_tenant";
            columns: ["latest_patient_report", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_conditions";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "latest_report_tenant";
            columns: ["latest_patient_report", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_medications";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "latest_report_tenant";
            columns: ["latest_patient_report", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_reports";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_encounters_department_id_hospital_id_fkey";
            columns: ["department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_encounters_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_encounters_patient_id_hospital_id_fkey";
            columns: ["patient_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      patient_questionnaires: {
        Row: {
          clinical_validated: boolean;
          created_at: string;
          definition: NonNullable<Json>;
          title: string;
          version: string;
        };
        ComputedFields: never;
        Insert: {
          clinical_validated?: boolean;
          created_at?: string;
          definition: NonNullable<Json>;
          title: string;
          version: string;
        };
        Update: {
          clinical_validated?: boolean;
          created_at?: string;
          definition?: NonNullable<Json>;
          title?: string;
          version?: string;
        };
        Relationships: [];
      };
      patient_reports: {
        Row: {
          answers: NonNullable<Json>;
          encounter_id: string;
          hospital_id: string;
          id: string;
          operation_id: string;
          patient_id: string;
          previous_report_id: string | null;
          questionnaire_version: string;
          source: string;
          submitted_at: string;
          token_id: string;
        };
        ComputedFields: never;
        Insert: {
          answers: NonNullable<Json>;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          operation_id: string;
          patient_id: string;
          previous_report_id?: string | null;
          questionnaire_version: string;
          source?: string;
          submitted_at?: string;
          token_id: string;
        };
        Update: {
          answers?: NonNullable<Json>;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          operation_id?: string;
          patient_id?: string;
          previous_report_id?: string | null;
          questionnaire_version?: string;
          source?: string;
          submitted_at?: string;
          token_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_reports_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_reports_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_reports_patient_id_hospital_id_fkey";
            columns: ["patient_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_reports_previous_report_id_fkey";
            columns: ["previous_report_id"];
            isOneToOne: false;
            referencedRelation: "patient_allergies";
            referencedColumns: ["report_id"];
          },
          {
            foreignKeyName: "patient_reports_previous_report_id_fkey";
            columns: ["previous_report_id"];
            isOneToOne: false;
            referencedRelation: "patient_conditions";
            referencedColumns: ["report_id"];
          },
          {
            foreignKeyName: "patient_reports_previous_report_id_fkey";
            columns: ["previous_report_id"];
            isOneToOne: false;
            referencedRelation: "patient_medications";
            referencedColumns: ["report_id"];
          },
          {
            foreignKeyName: "patient_reports_previous_report_id_fkey";
            columns: ["previous_report_id"];
            isOneToOne: false;
            referencedRelation: "patient_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_reports_questionnaire_version_fkey";
            columns: ["questionnaire_version"];
            isOneToOne: false;
            referencedRelation: "patient_questionnaires";
            referencedColumns: ["version"];
          },
          {
            foreignKeyName: "patient_reports_token_id_fkey";
            columns: ["token_id"];
            isOneToOne: false;
            referencedRelation: "encounter_access_tokens";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_status_events: {
        Row: {
          actor: string | null;
          created_at: string;
          encounter_id: string;
          from_status: string | null;
          hospital_id: string;
          id: string;
          reason: string;
          to_status: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          encounter_id: string;
          from_status?: string | null;
          hospital_id: string;
          id?: string;
          reason: string;
          to_status: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          encounter_id?: string;
          from_status?: string | null;
          hospital_id?: string;
          id?: string;
          reason?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_status_events_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_status_events_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          age: number | null;
          created_at: string;
          date_of_birth: string | null;
          emergency_contact: string | null;
          hospital_id: string;
          id: string;
          identifier: string | null;
          name: string;
          phone: string | null;
          sex: string | null;
          unidentified: boolean;
        };
        ComputedFields: never;
        Insert: {
          age?: number | null;
          created_at?: string;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          hospital_id: string;
          id?: string;
          identifier?: string | null;
          name: string;
          phone?: string | null;
          sex?: string | null;
          unidentified?: boolean;
        };
        Update: {
          age?: number | null;
          created_at?: string;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          hospital_id?: string;
          id?: string;
          identifier?: string | null;
          name?: string;
          phone?: string | null;
          sex?: string | null;
          unidentified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      preliminary_assessments: {
        Row: {
          category: Database["public"]["Enums"]["triage_category"];
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          matched_rules: NonNullable<Json>;
          missing: NonNullable<Json>;
          previous_category: Database["public"]["Enums"]["triage_category"];
          protocol_version: string;
          reasons: NonNullable<Json>;
          report_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          category: Database["public"]["Enums"]["triage_category"];
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          matched_rules?: NonNullable<Json>;
          missing?: NonNullable<Json>;
          previous_category: Database["public"]["Enums"]["triage_category"];
          protocol_version: string;
          reasons: NonNullable<Json>;
          report_id?: string | null;
        };
        Update: {
          category?: Database["public"]["Enums"]["triage_category"];
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          matched_rules?: NonNullable<Json>;
          missing?: NonNullable<Json>;
          previous_category?: Database["public"]["Enums"]["triage_category"];
          protocol_version?: string;
          reasons?: NonNullable<Json>;
          report_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "preliminary_assessments_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "preliminary_assessments_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "preliminary_assessments_report_id_hospital_id_fkey";
            columns: ["report_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_allergies";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "preliminary_assessments_report_id_hospital_id_fkey";
            columns: ["report_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_conditions";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "preliminary_assessments_report_id_hospital_id_fkey";
            columns: ["report_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_medications";
            referencedColumns: ["report_id", "hospital_id"];
          },
          {
            foreignKeyName: "preliminary_assessments_report_id_hospital_id_fkey";
            columns: ["report_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_reports";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      reassessment_records: {
        Row: {
          actor: string | null;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          reason: string;
          resolved_at: string | null;
          resolved_by: string | null;
          source: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          reason: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          source: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          reason?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reassessment_records_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "reassessment_records_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      referral_facilities: {
        Row: {
          availability_note: string;
          contact: string;
          hospital_id: string;
          id: string;
          name: string;
          services: string;
        };
        ComputedFields: never;
        Insert: {
          availability_note?: string;
          contact: string;
          hospital_id: string;
          id?: string;
          name: string;
          services: string;
        };
        Update: {
          availability_note?: string;
          contact?: string;
          hospital_id?: string;
          id?: string;
          name?: string;
          services?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_facilities_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          acknowledgement: string | null;
          created_at: string;
          doctor_id: string;
          encounter_id: string;
          facility_id: string;
          hospital_id: string;
          id: string;
          reason: string;
          status: string;
          summary: string;
          transport: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          acknowledgement?: string | null;
          created_at?: string;
          doctor_id: string;
          encounter_id: string;
          facility_id: string;
          hospital_id: string;
          id?: string;
          reason: string;
          status?: string;
          summary: string;
          transport: string;
          updated_at?: string;
        };
        Update: {
          acknowledgement?: string | null;
          created_at?: string;
          doctor_id?: string;
          encounter_id?: string;
          facility_id?: string;
          hospital_id?: string;
          id?: string;
          reason?: string;
          status?: string;
          summary?: string;
          transport?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "referrals_facility_id_hospital_id_fkey";
            columns: ["facility_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "referral_facilities";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "referrals_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_requests: {
        Row: {
          acknowledged_by: string | null;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          kind: string;
          reason: string;
          requested_by: string | null;
          reservation_id: string | null;
          status: string;
          token_id: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          acknowledged_by?: string | null;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          kind: string;
          reason: string;
          requested_by?: string | null;
          reservation_id?: string | null;
          status?: string;
          token_id?: string | null;
          updated_at?: string;
        };
        Update: {
          acknowledged_by?: string | null;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          kind?: string;
          reason?: string;
          requested_by?: string | null;
          reservation_id?: string | null;
          status?: string;
          token_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_requests_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "resource_requests_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_requests_reservation_id_fkey";
            columns: ["reservation_id"];
            isOneToOne: false;
            referencedRelation: "resource_reservations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_requests_token_id_fkey";
            columns: ["token_id"];
            isOneToOne: false;
            referencedRelation: "encounter_access_tokens";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_reservations: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string;
          hold_until: string | null;
          hospital_id: string;
          id: string;
          is_bed: boolean;
          released_at: string | null;
          resource_id: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id: string;
          hold_until?: string | null;
          hospital_id: string;
          id?: string;
          is_bed?: boolean;
          released_at?: string | null;
          resource_id: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string;
          hold_until?: string | null;
          hospital_id?: string;
          id?: string;
          is_bed?: boolean;
          released_at?: string | null;
          resource_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_reservations_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "resource_reservations_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_reservations_resource_id_hospital_id_fkey";
            columns: ["resource_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospital_resources";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      resource_shortages: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          kind: string;
          reason: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          kind: string;
          reason: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          kind?: string;
          reason?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_shortages_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "resource_shortages_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_status_history: {
        Row: {
          actor: string | null;
          created_at: string;
          from_status: string | null;
          hospital_id: string;
          id: string;
          resource_id: string;
          to_status: string;
        };
        ComputedFields: never;
        Insert: {
          actor?: string | null;
          created_at?: string;
          from_status?: string | null;
          hospital_id: string;
          id?: string;
          resource_id: string;
          to_status: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string;
          from_status?: string | null;
          hospital_id?: string;
          id?: string;
          resource_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_status_history_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_status_history_resource_id_hospital_id_fkey";
            columns: ["resource_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospital_resources";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      staff_department_memberships: {
        Row: {
          assigned_by: string;
          created_at: string;
          department_id: string;
          hospital_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          assigned_by: string;
          created_at?: string;
          department_id: string;
          hospital_id: string;
          user_id: string;
        };
        Update: {
          assigned_by?: string;
          created_at?: string;
          department_id?: string;
          hospital_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_department_memberships_department_id_hospital_id_fkey";
            columns: ["department_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "staff_department_memberships_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_department_memberships_hospital_id_user_id_fkey";
            columns: ["hospital_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "hospital_memberships";
            referencedColumns: ["hospital_id", "user_id"];
          },
        ];
      };
      staff_shifts: {
        Row: {
          ends_at: string;
          hospital_id: string;
          id: string;
          starts_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          ends_at: string;
          hospital_id: string;
          id?: string;
          starts_at: string;
          user_id: string;
        };
        Update: {
          ends_at?: string;
          hospital_id?: string;
          id?: string;
          starts_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_shifts_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_records: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          kind: string;
          note: string;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          kind: string;
          note: string;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          kind?: string;
          note?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_records_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "treatment_records_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      triage_assessments: {
        Row: {
          actor: string;
          confirmed_category: Database["public"]["Enums"]["triage_category"];
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          input: NonNullable<Json>;
          proposed_category: Database["public"]["Enums"]["triage_category"];
          protocol: string;
          reason: string;
          result: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          confirmed_category: Database["public"]["Enums"]["triage_category"];
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          input: NonNullable<Json>;
          proposed_category: Database["public"]["Enums"]["triage_category"];
          protocol?: string;
          reason: string;
          result: NonNullable<Json>;
        };
        Update: {
          actor?: string;
          confirmed_category?: Database["public"]["Enums"]["triage_category"];
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          input?: NonNullable<Json>;
          proposed_category?: Database["public"]["Enums"]["triage_category"];
          protocol?: string;
          reason?: string;
          result?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "triage_assessments_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "triage_assessments_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      triage_protocol_versions: {
        Row: {
          approved_at: string | null;
          configuration: NonNullable<Json>;
          effective_at: string | null;
          hospital_id: string;
          id: string;
          name: string;
          reference: string | null;
          reviewer: string | null;
          status: string;
          version: string;
        };
        ComputedFields: never;
        Insert: {
          approved_at?: string | null;
          configuration?: NonNullable<Json>;
          effective_at?: string | null;
          hospital_id: string;
          id?: string;
          name: string;
          reference?: string | null;
          reviewer?: string | null;
          status?: string;
          version: string;
        };
        Update: {
          approved_at?: string | null;
          configuration?: NonNullable<Json>;
          effective_at?: string | null;
          hospital_id?: string;
          id?: string;
          name?: string;
          reference?: string | null;
          reviewer?: string | null;
          status?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "triage_protocol_versions_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      vital_signs: {
        Row: {
          actor: string;
          created_at: string;
          encounter_id: string;
          hospital_id: string;
          id: string;
          pulse: number | null;
          respiratory_rate: number | null;
          spo2: number | null;
          systolic: number | null;
          temperature: number | null;
        };
        ComputedFields: never;
        Insert: {
          actor: string;
          created_at?: string;
          encounter_id: string;
          hospital_id: string;
          id?: string;
          pulse?: number | null;
          respiratory_rate?: number | null;
          spo2?: number | null;
          systolic?: number | null;
          temperature?: number | null;
        };
        Update: {
          actor?: string;
          created_at?: string;
          encounter_id?: string;
          hospital_id?: string;
          id?: string;
          pulse?: number | null;
          respiratory_rate?: number | null;
          spo2?: number | null;
          systolic?: number | null;
          temperature?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "vital_signs_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "vital_signs_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      patient_allergies: {
        Row: {
          encounter_id: string;
          hospital_id: string;
          patient_id: string;
          reaction: string | null;
          report_id: string;
          submitted_at: string;
          substance: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "patient_reports_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_reports_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_reports_patient_id_hospital_id_fkey";
            columns: ["patient_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      patient_conditions: {
        Row: {
          condition: string | null;
          encounter_id: string;
          hospital_id: string;
          patient_id: string;
          report_id: string;
          submitted_at: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "patient_reports_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_reports_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_reports_patient_id_hospital_id_fkey";
            columns: ["patient_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
      patient_medications: {
        Row: {
          details: string | null;
          dose: string | null;
          encounter_id: string;
          frequency: string | null;
          hospital_id: string;
          name: string | null;
          patient_id: string;
          report_id: string;
          submitted_at: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "patient_reports_encounter_id_hospital_id_fkey";
            columns: ["encounter_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patient_encounters";
            referencedColumns: ["id", "hospital_id"];
          },
          {
            foreignKeyName: "patient_reports_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_reports_patient_id_hospital_id_fkey";
            columns: ["patient_id", "hospital_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id", "hospital_id"];
          },
        ];
      };
    };
    Functions: {
      archive_demo_tests: { Args: { p_hospital: string }; Returns: number };
      escalate_alerts: { Args: { p_hospital: string }; Returns: number };
      find_patients: {
        Args: { p_hospital: string; p_query: string };
        Returns: {
          age: number | null;
          created_at: string;
          date_of_birth: string | null;
          emergency_contact: string | null;
          hospital_id: string;
          id: string;
          identifier: string | null;
          name: string;
          phone: string | null;
          sex: string | null;
          unidentified: boolean;
        }[];
        SetofOptions: {
          from: "*";
          to: "patients";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      patient_portal: {
        Args: { p_action: string; p_data?: Json; p_token: string };
        Returns: Json;
      };
      staff_command: {
        Args: { p_action: string; p_data: Json; p_hospital: string };
        Returns: Json;
      };
      workspace_directory: { Args: { p_hospital: string }; Returns: Json };
      workspace_snapshot: { Args: { p_hospital: string }; Returns: Json };
    };
    Enums: {
      staff_role:
        | "super_admin"
        | "hospital_admin"
        | "receptionist"
        | "triage_nurse"
        | "nurse"
        | "doctor"
        | "emergency_coordinator"
        | "resource_manager";
      triage_category: "RED" | "YELLOW" | "GREEN" | "ASSESSMENT_REQUIRED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
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
} as const;
