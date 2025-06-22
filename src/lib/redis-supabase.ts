// src/lib/redis-supabase.ts (utilisation du wrapper Redis Supabase)
import { supabase } from './supabase'
import { Message, ChatSession } from '@/types/chat'

class SupabaseRedisClient {
  private wrapperName = 'chats' // Nom de votre wrapper Redis

  // Messages operations
  async saveMessage(message: Message): Promise<void> {
    const key = `session:${message.sessionId}:messages`
    
    await supabase.rpc('redis_lpush', {
      wrapper_name: this.wrapperName,
      key: key,
      value: JSON.stringify({
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp.toISOString(),
        sessionId: message.sessionId,
      })
    })

    // Incrémenter le compteur de messages
    await supabase.rpc('redis_hincrby', {
      wrapper_name: this.wrapperName,
      key: `session:${message.sessionId}`,
      field: 'messageCount',
      increment: 1
    })

    // Mettre à jour la date de modification
    await supabase.rpc('redis_hset', {
      wrapper_name: this.wrapperName,
      key: `session:${message.sessionId}`,
      field: 'updatedAt',
      value: new Date().toISOString()
    })
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase.rpc('redis_lrange', {
      wrapper_name: this.wrapperName,
      key: `session:${sessionId}:messages`,
      start: 0,
      stop: -1
    })

    if (error) throw error

    return (data || [])
      .map((item: string) => {
        try {
          const parsed = JSON.parse(item)
          return {
            id: parsed.id,
            content: parsed.content,
            sender: parsed.sender,
            timestamp: new Date(parsed.timestamp),
            sessionId: parsed.sessionId,
          }
        } catch (error) {
          console.error('Failed to parse message:', error)
          return null
        }
      })
      .filter((msg): msg is Message => msg !== null)
      .reverse() // Chronologique
  }

  // Chat session operations
  async createChatSession(session: ChatSession): Promise<void> {
    // Sauvegarder les données de session
    await supabase.rpc('redis_hset_multiple', {
      wrapper_name: this.wrapperName,
      key: `session:${session.id}`,
      fields: {
        id: session.id,
        userId: session.userId,
        title: session.title,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        messageCount: session.messageCount.toString(),
      }
    })

    // Ajouter à la liste des sessions utilisateur
    await supabase.rpc('redis_sadd', {
      wrapper_name: this.wrapperName,
      key: `user:${session.userId}:sessions`,
      member: session.id
    })
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase.rpc('redis_hgetall', {
      wrapper_name: this.wrapperName,
      key: `session:${sessionId}`
    })

    if (error || !data || !data.id) return null

    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      messageCount: parseInt(data.messageCount || '0'),
    }
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const { data: sessionIds, error } = await supabase.rpc('redis_smembers', {
      wrapper_name: this.wrapperName,
      key: `user:${userId}:sessions`
    })

    if (error || !sessionIds) return []

    const sessions: ChatSession[] = []
    for (const sessionId of sessionIds) {
      const session = await this.getChatSession(sessionId)
      if (session) sessions.push(session)
    }

    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }
}

export const redisSupabase = new SupabaseRedisClient()
