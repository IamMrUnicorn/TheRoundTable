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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      availability_exceptions: {
        Row: {
          availability: string
          campaign_id: number
          created_at: string
          ends_at: string
          id: number
          note: string
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability: string
          campaign_id: number
          created_at?: string
          ends_at: string
          id?: never
          note?: string
          starts_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string
          campaign_id?: number
          created_at?: string
          ends_at?: string
          id?: never
          note?: string
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'availability_exceptions_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'availability_exceptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      availability_rules: {
        Row: {
          campaign_id: number
          created_at: string
          end_minute: number
          id: number
          preference: string
          start_minute: number
          updated_at: string
          user_id: string
          weekday: number
        }
        Insert: {
          campaign_id: number
          created_at?: string
          end_minute: number
          id?: never
          preference?: string
          start_minute: number
          updated_at?: string
          user_id: string
          weekday: number
        }
        Update: {
          campaign_id?: number
          created_at?: string
          end_minute?: number
          id?: never
          preference?: string
          start_minute?: number
          updated_at?: string
          user_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'availability_rules_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'availability_rules_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_members: {
        Row: {
          campaign_id: number
          created_at: string
          joined_at: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          joined_at?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          joined_at?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_members_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaigns: {
        Row: {
          cadence: string
          created_at: string
          description: string
          id: number
          invite_code: string
          name: string
          owner_id: string
          preferred_session_minutes: number
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          cadence?: string
          created_at?: string
          description?: string
          id?: never
          invite_code?: string
          name: string
          owner_id: string
          preferred_session_minutes?: number
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          cadence?: string
          created_at?: string
          description?: string
          id?: never
          invite_code?: string
          name?: string
          owner_id?: string
          preferred_session_minutes?: number
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaigns_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      characters: {
        Row: {
          ancestry: string
          armor_class: number
          background: string
          campaign_id: number | null
          charisma: number
          class_name: string
          constitution: number
          created_at: string
          current_hp: number
          dexterity: number
          id: number
          intelligence: number
          level: number
          max_hp: number
          name: string
          notes: string
          owner_id: string
          speed: number
          strength: number
          subclass: string
          updated_at: string
          wisdom: number
        }
        Insert: {
          ancestry?: string
          armor_class?: number
          background?: string
          campaign_id?: number | null
          charisma?: number
          class_name?: string
          constitution?: number
          created_at?: string
          current_hp?: number
          dexterity?: number
          id?: never
          intelligence?: number
          level?: number
          max_hp?: number
          name: string
          notes?: string
          owner_id: string
          speed?: number
          strength?: number
          subclass?: string
          updated_at?: string
          wisdom?: number
        }
        Update: {
          ancestry?: string
          armor_class?: number
          background?: string
          campaign_id?: number | null
          charisma?: number
          class_name?: string
          constitution?: number
          created_at?: string
          current_hp?: number
          dexterity?: number
          id?: never
          intelligence?: number
          level?: number
          max_hp?: number
          name?: string
          notes?: string
          owner_id?: string
          speed?: number
          strength?: number
          subclass?: string
          updated_at?: string
          wisdom?: number
        }
        Relationships: [
          {
            foreignKeyName: 'characters_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'characters_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name: string
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_attendance: {
        Row: {
          note: string
          responded_at: string | null
          response: string
          session_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          note?: string
          responded_at?: string | null
          response?: string
          session_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          note?: string
          responded_at?: string | null
          response?: string
          session_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_attendance_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_attendance_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      sessions: {
        Row: {
          agenda: string
          campaign_id: number
          created_at: string
          created_by: string
          ends_at: string
          id: number
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agenda?: string
          campaign_id: number
          created_at?: string
          created_by: string
          ends_at: string
          id?: never
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agenda?: string
          campaign_id?: number
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: never
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sessions_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sessions_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_campaign: { Args: { campaign_code: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
