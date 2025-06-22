// src/lib/supabase.ts (version optimisée pour WebSocket)
import { createBrowserClient } from '@supabase/ssr'

// Client pour les composants côté client uniquement
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        heartbeatIntervalMs: 30000,
        timeout: 20000
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    }
  )
}

// Instance client par défaut pour l'export legacy
export const supabase = createClient()

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          session_id?: string | null
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          message_count: number
        }
        Insert: {
          id: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
          message_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          updated_at?: string
          message_count?: number
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          content: string
          sender: 'user' | 'assistant'
          timestamp: string
        }
        Insert: {
          id: string
          session_id: string
          content: string
          sender: 'user' | 'assistant'
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          content?: string
          sender?: 'user' | 'assistant'
          timestamp?: string
        }
      }
    }
  }
}