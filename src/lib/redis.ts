// src/lib/redis.ts
// Note: Ce fichier n'est plus nécessaire avec Supabase, mais gardé pour compatibilité

export interface Message {
    id: string
    content: string
    sender: 'user' | 'assistant'
    timestamp: Date
    sessionId: string
  }
  
  export interface ChatSession {
    id: string
    userId: string
    title: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
  }
  
  // Fonctions placeholder pour compatibilité
  export const redis = {
    async getChatSession(sessionId: string): Promise<ChatSession | null> {
      console.warn('Redis getChatSession called - should use Supabase instead')
      return null
    },
  
    async saveMessage(message: Message): Promise<void> {
      console.warn('Redis saveMessage called - should use Supabase instead')
    },
  
    async getMessages(sessionId: string): Promise<Message[]> {
      console.warn('Redis getMessages called - should use Supabase instead')
      return []
    },
  
    async createChatSession(session: Omit<ChatSession, 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
      console.warn('Redis createChatSession called - should use Supabase instead')
      return {
        ...session,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }