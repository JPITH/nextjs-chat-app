// src/lib/supabase.ts - Configuration Realtime corrigée
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        // Désactiver le heartbeat qui cause des problèmes
        heartbeatIntervalMs: 60000, // Augmenté à 1 minute
        timeout: 40000, // Augmenté à 40 secondes
        // Réessayer automatiquement
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000)
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    }
  )
}

export const supabase = createClient()

// Fonction utilitaire pour vérifier si Realtime est activé
export async function checkRealtimeStatus() {
  try {
    const testChannel = supabase.channel('test-connection')
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        supabase.removeChannel(testChannel)
        resolve(false)
      }, 5000)

      testChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          supabase.removeChannel(testChannel)
          resolve(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout)
          supabase.removeChannel(testChannel)
          resolve(false)
        }
      })
    })
  } catch (error) {
    console.error('Erreur test Realtime:', error)
    return false
  }
}

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
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          genre: string | null
          target_words: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          genre?: string | null
          target_words?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          genre?: string | null
          target_words?: number | null
          updated_at?: string
        }
      }
      book_chat: {
        Row: {
          id: string
          book_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          title?: string
          content?: string
          updated_at?: string
        }
      }
    }
  }
}