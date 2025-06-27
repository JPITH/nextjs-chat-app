export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          room_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          room_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          room_id?: string
          updated_at?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          is_public: boolean
          created_by: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          is_public?: boolean
          created_by: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_by?: string
          updated_at?: string | null
        }
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
