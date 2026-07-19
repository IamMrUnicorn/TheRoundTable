export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows createClient to infer the linked project's PostgREST version.
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
          action_used: boolean
          bonus_action_used: boolean
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
      campaign_announcements: {
        Row: {
          author_id: string
          body: string
          campaign_id: number
          created_at: string
          id: number
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          campaign_id: number
          created_at?: string
          id?: never
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          campaign_id?: number
          created_at?: string
          id?: never
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_announcements_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_announcements_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_documents: {
        Row: {
          author_id: string
          body: string
          campaign_id: number
          created_at: string
          id: number
          is_pinned: boolean
          kind: string
          title: string
          updated_at: string
          url: string
          visibility: string
        }
        Insert: {
          author_id: string
          body?: string
          campaign_id: number
          created_at?: string
          id?: never
          is_pinned?: boolean
          kind?: string
          title: string
          updated_at?: string
          url?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          body?: string
          campaign_id?: number
          created_at?: string
          id?: never
          is_pinned?: boolean
          kind?: string
          title?: string
          updated_at?: string
          url?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_documents_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_documents_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_gm_states: {
        Row: {
          campaign_id: number
          created_at: string
          secret_state: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          secret_state?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          secret_state?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_gm_states_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: true
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_gm_states_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_inventory_items: {
        Row: {
          campaign_id: number
          category: string
          created_at: string
          created_by: string
          description: string
          holder: string
          id: number
          name: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          category?: string
          created_at?: string
          created_by: string
          description?: string
          holder?: string
          id?: never
          name: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          holder?: string
          id?: never
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_inventory_items_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_inventory_items_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_invitations: {
        Row: {
          campaign_id: number
          created_at: string
          expires_at: string
          id: number
          invited_by: string
          invited_email: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          expires_at?: string
          id?: never
          invited_by: string
          invited_email: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          expires_at?: string
          id?: never
          invited_by?: string
          invited_email?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_invitations_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_invitations_invited_by_fkey'
            columns: ['invited_by']
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
      campaign_objectives: {
        Row: {
          campaign_id: number
          created_at: string
          created_by: string
          description: string
          id: number
          is_secret: boolean
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          created_by: string
          description?: string
          id?: never
          is_secret?: boolean
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          created_by?: string
          description?: string
          id?: never
          is_secret?: boolean
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_objectives_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_objectives_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_references: {
        Row: {
          campaign_id: number
          created_at: string
          created_by: string
          details: string
          id: number
          is_secret: boolean
          kind: string
          name: string
          status: string
          summary: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          created_by: string
          details?: string
          id?: never
          is_secret?: boolean
          kind: string
          name: string
          status?: string
          summary?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          created_by?: string
          details?: string
          id?: never
          is_secret?: boolean
          kind?: string
          name?: string
          status?: string
          summary?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_references_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_references_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_tasks: {
        Row: {
          assigned_to: string | null
          campaign_id: number
          category: string
          created_at: string
          created_by: string
          description: string
          due_at: string | null
          id: number
          is_gm_only: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id: number
          category?: string
          created_at?: string
          created_by: string
          description?: string
          due_at?: string | null
          id?: never
          is_gm_only?: boolean
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          due_at?: string | null
          id?: never
          is_gm_only?: boolean
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_tasks_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_tasks_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_tasks_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaign_world_states: {
        Row: {
          campaign_id: number
          created_at: string
          current_location: string
          in_world_datetime: string
          summary: string
          updated_at: string
          updated_by: string
          weather: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          current_location?: string
          in_world_datetime?: string
          summary?: string
          updated_at?: string
          updated_by: string
          weather?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          current_location?: string
          in_world_datetime?: string
          summary?: string
          updated_at?: string
          updated_by?: string
          weather?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campaign_world_states_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: true
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaign_world_states_updated_by_fkey'
            columns: ['updated_by']
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
          requires_join_approval: boolean
          ruleset: string
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
          requires_join_approval?: boolean
          ruleset?: string
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
          requires_join_approval?: boolean
          ruleset?: string
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
      character_features: {
        Row: {
          character_id: number
          created_at: string
          description: string
          id: number
          is_active: boolean
          kind: string
          level_acquired: number | null
          max_uses: number | null
          name: string
          recovery: string | null
          sort_order: number
          source: string
          updated_at: string
          uses_remaining: number | null
        }
        Insert: {
          character_id: number
          created_at?: string
          description?: string
          id?: never
          is_active?: boolean
          kind?: string
          level_acquired?: number | null
          max_uses?: number | null
          name: string
          recovery?: string | null
          sort_order?: number
          source?: string
          updated_at?: string
          uses_remaining?: number | null
        }
        Update: {
          character_id?: number
          created_at?: string
          description?: string
          id?: never
          is_active?: boolean
          kind?: string
          level_acquired?: number | null
          max_uses?: number | null
          name?: string
          recovery?: string | null
          sort_order?: number
          source?: string
          updated_at?: string
          uses_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'character_features_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
      character_inventory_items: {
        Row: {
          category: string
          character_id: number
          created_at: string
          description: string
          id: number
          is_attuned: boolean
          is_equipped: boolean
          location: string
          name: string
          notes: string
          quantity: number
          updated_at: string
          value: string
          weight: number | null
        }
        Insert: {
          category?: string
          character_id: number
          created_at?: string
          description?: string
          id?: never
          is_attuned?: boolean
          is_equipped?: boolean
          location?: string
          name: string
          notes?: string
          quantity?: number
          updated_at?: string
          value?: string
          weight?: number | null
        }
        Update: {
          category?: string
          character_id?: number
          created_at?: string
          description?: string
          id?: never
          is_attuned?: boolean
          is_equipped?: boolean
          location?: string
          name?: string
          notes?: string
          quantity?: number
          updated_at?: string
          value?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'character_inventory_items_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
      character_memories: {
        Row: {
          campaign_id: number | null
          character_id: number
          created_at: string
          created_by: string
          id: number
          in_world_time: string
          is_pinned: boolean
          kind: string
          location: string
          metadata: Json
          occurred_at: string
          player_annotation: string
          session_id: number | null
          source_name: string
          source_reference: string
          summary: string
          tags: string[]
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          campaign_id?: number | null
          character_id: number
          created_at?: string
          created_by: string
          id?: never
          in_world_time?: string
          is_pinned?: boolean
          kind?: string
          location?: string
          metadata?: Json
          occurred_at?: string
          player_annotation?: string
          session_id?: number | null
          source_name?: string
          source_reference?: string
          summary?: string
          tags?: string[]
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          campaign_id?: number | null
          character_id?: number
          created_at?: string
          created_by?: string
          id?: never
          in_world_time?: string
          is_pinned?: boolean
          kind?: string
          location?: string
          metadata?: Json
          occurred_at?: string
          player_annotation?: string
          session_id?: number | null
          source_name?: string
          source_reference?: string
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'character_memories_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'character_memories_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'character_memories_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'character_memories_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
        ]
      }
      character_spell_slots: {
        Row: {
          maximum: number
          profile_id: number
          remaining: number
          spell_level: number
          updated_at: string
        }
        Insert: {
          maximum: number
          profile_id: number
          remaining: number
          spell_level: number
          updated_at?: string
        }
        Update: {
          maximum?: number
          profile_id?: number
          remaining?: number
          spell_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'character_spell_slots_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'character_spellcasting_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      character_spellcasting_profiles: {
        Row: {
          character_id: number
          created_at: string
          id: number
          is_pact_magic: boolean
          max_prepared: number | null
          name: string
          preparation_mode: string
          spell_attack_bonus: number | null
          spell_save_dc: number | null
          spellcasting_ability: string
          updated_at: string
        }
        Insert: {
          character_id: number
          created_at?: string
          id?: never
          is_pact_magic?: boolean
          max_prepared?: number | null
          name: string
          preparation_mode?: string
          spell_attack_bonus?: number | null
          spell_save_dc?: number | null
          spellcasting_ability: string
          updated_at?: string
        }
        Update: {
          character_id?: number
          created_at?: string
          id?: never
          is_pact_magic?: boolean
          max_prepared?: number | null
          name?: string
          preparation_mode?: string
          spell_attack_bonus?: number | null
          spell_save_dc?: number | null
          spellcasting_ability?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'character_spellcasting_profiles_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
      character_spells: {
        Row: {
          casting_time: string
          components: string
          created_at: string
          description: string
          duration: string
          id: number
          is_favorite: boolean
          is_prepared: boolean
          is_ritual: boolean
          name: string
          profile_id: number
          range: string
          requires_concentration: boolean
          school: string
          spell_level: number
          updated_at: string
        }
        Insert: {
          casting_time?: string
          components?: string
          created_at?: string
          description?: string
          duration?: string
          id?: never
          is_favorite?: boolean
          is_prepared?: boolean
          is_ritual?: boolean
          name: string
          profile_id: number
          range?: string
          requires_concentration?: boolean
          school?: string
          spell_level: number
          updated_at?: string
        }
        Update: {
          casting_time?: string
          components?: string
          created_at?: string
          description?: string
          duration?: string
          id?: never
          is_favorite?: boolean
          is_prepared?: boolean
          is_ritual?: boolean
          name?: string
          profile_id?: number
          range?: string
          requires_concentration?: boolean
          school?: string
          spell_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'character_spells_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'character_spellcasting_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      characters: {
        Row: {
          age: string
          alignment: string
          allies_organizations: string
          ancestry: string
          appearance: string
          armor_class: number
          background: string
          biography: string
          bonds: string
          campaign_id: number | null
          charisma: number
          class_name: string
          concentration: string
          conditions: string[]
          constitution: number
          created_at: string
          current_hp: number
          death_save_failures: number
          death_save_successes: number
          dexterity: number
          exhaustion: number
          eyes: string
          flaws: string
          hair: string
          height: string
          hit_dice_remaining: number
          hit_dice_total: number
          hit_die_size: number
          id: number
          ideals: string
          inspiration: boolean
          intelligence: number
          languages: string[]
          level: number
          max_hp: number
          name: string
          notes: string
          owner_id: string
          personality_traits: string
          pronouns: string
          saving_throw_proficiencies: string[]
          senses: string[]
          size: string
          skill_expertise: string[]
          skill_proficiencies: string[]
          skin: string
          speed: number
          strength: number
          subclass: string
          temporary_hp: number
          updated_at: string
          weight_lbs: number | null
          wisdom: number
        }
        Insert: {
          age?: string
          alignment?: string
          allies_organizations?: string
          ancestry?: string
          appearance?: string
          armor_class?: number
          background?: string
          biography?: string
          bonds?: string
          campaign_id?: number | null
          charisma?: number
          class_name?: string
          concentration?: string
          conditions?: string[]
          constitution?: number
          created_at?: string
          current_hp?: number
          death_save_failures?: number
          death_save_successes?: number
          dexterity?: number
          exhaustion?: number
          eyes?: string
          flaws?: string
          hair?: string
          height?: string
          hit_dice_remaining?: number
          hit_dice_total?: number
          hit_die_size?: number
          id?: never
          ideals?: string
          inspiration?: boolean
          intelligence?: number
          languages?: string[]
          level?: number
          max_hp?: number
          name: string
          notes?: string
          owner_id: string
          personality_traits?: string
          pronouns?: string
          saving_throw_proficiencies?: string[]
          senses?: string[]
          size?: string
          skill_expertise?: string[]
          skill_proficiencies?: string[]
          skin?: string
          speed?: number
          strength?: number
          subclass?: string
          temporary_hp?: number
          updated_at?: string
          weight_lbs?: number | null
          wisdom?: number
        }
        Update: {
          age?: string
          alignment?: string
          allies_organizations?: string
          ancestry?: string
          appearance?: string
          armor_class?: number
          background?: string
          biography?: string
          bonds?: string
          campaign_id?: number | null
          charisma?: number
          class_name?: string
          concentration?: string
          conditions?: string[]
          constitution?: number
          created_at?: string
          current_hp?: number
          death_save_failures?: number
          death_save_successes?: number
          dexterity?: number
          exhaustion?: number
          eyes?: string
          flaws?: string
          hair?: string
          height?: string
          hit_dice_remaining?: number
          hit_dice_total?: number
          hit_die_size?: number
          id?: never
          ideals?: string
          inspiration?: boolean
          intelligence?: number
          languages?: string[]
          level?: number
          max_hp?: number
          name?: string
          notes?: string
          owner_id?: string
          personality_traits?: string
          pronouns?: string
          saving_throw_proficiencies?: string[]
          senses?: string[]
          size?: string
          skill_expertise?: string[]
          skill_proficiencies?: string[]
          skin?: string
          speed?: number
          strength?: number
          subclass?: string
          temporary_hp?: number
          updated_at?: string
          weight_lbs?: number | null
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
      notifications: {
        Row: {
          body: string
          campaign_id: number | null
          created_at: string
          id: number
          kind: string
          read_at: string | null
          recipient_id: string
          session_id: number | null
          title: string
        }
        Insert: {
          body?: string
          campaign_id?: number | null
          created_at?: string
          id?: never
          kind: string
          read_at?: string | null
          recipient_id: string
          session_id?: number | null
          title: string
        }
        Update: {
          body?: string
          campaign_id?: number | null
          created_at?: string
          id?: never
          kind?: string
          read_at?: string | null
          recipient_id?: string
          session_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
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
      session_encounters: {
        Row: {
          active_character_id: number | null
          campaign_id: number
          created_at: string
          round_number: number
          session_id: number
          updated_at: string
        }
        Insert: {
          active_character_id?: number | null
          campaign_id: number
          created_at?: string
          round_number?: number
          session_id: number
          updated_at?: string
        }
        Update: {
          active_character_id?: number | null
          campaign_id?: number
          created_at?: string
          round_number?: number
          session_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      session_action_proposals: {
        Row: {
          approval_mode: string
          campaign_id: number
          character_id: number | null
          created_at: string
          created_by: string
          details: string
          id: number
          kind: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string
          session_id: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_mode?: string
          campaign_id: number
          character_id?: number | null
          created_at?: string
          created_by: string
          details?: string
          id?: never
          kind: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string
          session_id: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_mode?: string
          campaign_id?: number
          character_id?: number | null
          created_at?: string
          created_by?: string
          details?: string
          id?: never
          kind?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string
          session_id?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_reaction_prompts: {
        Row: {
          campaign_id: number
          character_id: number
          created_at: string
          created_by: string
          expires_at: string
          id: number
          prompt: string
          responded_at: string | null
          session_id: number
          status: string
          target_user_id: string
        }
        Insert: {
          campaign_id: number
          character_id: number
          created_at?: string
          created_by: string
          expires_at: string
          id?: never
          prompt: string
          responded_at?: string | null
          session_id: number
          status?: string
          target_user_id: string
        }
        Update: {
          campaign_id?: number
          character_id?: number
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: never
          prompt?: string
          responded_at?: string | null
          session_id?: number
          status?: string
          target_user_id?: string
        }
        Relationships: []
      }
      session_initiative_entries: {
        Row: {
          action_used: boolean
          bonus_action_used: boolean
          campaign_id: number
          character_id: number
          created_at: string
          created_by: string
          id: number
          initiative: number
          movement_used: number
          object_interaction_used: boolean
          reaction_used: boolean
          session_id: number
          updated_at: string
        }
        Insert: {
          action_used?: boolean
          bonus_action_used?: boolean
          campaign_id: number
          character_id: number
          created_at?: string
          created_by: string
          id?: never
          initiative: number
          movement_used?: number
          object_interaction_used?: boolean
          reaction_used?: boolean
          session_id: number
          updated_at?: string
        }
        Update: {
          action_used?: boolean
          bonus_action_used?: boolean
          campaign_id?: number
          character_id?: number
          created_at?: string
          created_by?: string
          id?: never
          initiative?: number
          movement_used?: number
          object_interaction_used?: boolean
          reaction_used?: boolean
          session_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      session_attendance: {
        Row: {
          note: string
          ready_at: string | null
          responded_at: string | null
          response: string
          session_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          note?: string
          ready_at?: string | null
          responded_at?: string | null
          response?: string
          session_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          note?: string
          ready_at?: string | null
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
      session_events: {
        Row: {
          actor_id: string
          body: string
          campaign_id: number
          character_id: number | null
          created_at: string
          id: number
          in_world_time: string
          kind: string
          location: string
          metadata: Json
          occurred_at: string
          round_number: number | null
          sequence_number: number
          session_id: number
          title: string
          visibility: string
        }
        Insert: {
          actor_id: string
          body?: string
          campaign_id: number
          character_id?: number | null
          created_at?: string
          id?: never
          in_world_time?: string
          kind?: string
          location?: string
          metadata?: Json
          occurred_at?: string
          round_number?: number | null
          sequence_number?: number
          session_id: number
          title: string
          visibility?: string
        }
        Update: {
          actor_id?: string
          body?: string
          campaign_id?: number
          character_id?: number | null
          created_at?: string
          id?: never
          in_world_time?: string
          kind?: string
          location?: string
          metadata?: Json
          occurred_at?: string
          round_number?: number | null
          sequence_number?: number
          session_id?: number
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_events_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_events_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_events_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_events_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
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
      apply_character_health_change: {
        Args: {
          amount: number
          change_kind: string
          character_id: number
          session_id: number
        }
        Returns: Json
      }
      apply_character_status_change: {
        Args: {
          character_id: number
          operation: string
          session_id: number
          value?: string
        }
        Returns: Json
      }
      join_campaign: { Args: { campaign_code: string }; Returns: number }
      respond_campaign_invitation: {
        Args: { invitation_token: string; should_accept: boolean }
        Returns: number
      }
      respond_reaction_prompt: {
        Args: { prompt_id: number; should_accept: boolean }
        Returns: Database['public']['Tables']['session_reaction_prompts']['Row']
      }
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
