// Fichier supprimé : Redis n'est plus utilisé

export interface ChatMessage {
  id: string
  session_id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
}

export interface AIContext {
  summary?: string
  /**
   * Sauvegarder un message dans Supabase ET essayer Redis
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      // 1. TOUJOURS sauvegarder en Supabase (source de vérité)
      const { error: supabaseError } = await this.supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          session_id: message.session_id,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp
        })

      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError)
        throw supabaseError
      }

      console.log(`✅ Message ${message.id} sauvegardé en Supabase`)

      // 2. Essayer de sauvegarder en Redis (optionnel)
      try {
        // Pour l'instant, on se contente de Supabase
        // Le Redis wrapper sera utilisé pour la lecture uniquement
        console.log('💾 Message prêt pour Redis (lecture différée)')
      } catch (redisError) {
        console.warn('⚠️ Redis non disponible pour l\'écriture:', redisError)
        // Ne pas faire échouer si Redis est indisponible
      }

    } catch (error) {
      console.error('❌ Erreur saveMessage:', error)
      throw error
    }
  }

  /**
   * Récupérer les messages depuis Supabase (Redis en lecture seule pour l'instant)
   */
  async getMessagesForAI(sessionId: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      // Utiliser Supabase comme source principale
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      
      const messages = (data || [])
        .reverse()
        .map(msg => ({
          id: msg.id,
          session_id: msg.session_id,
          content: msg.content,
          sender: msg.sender as 'user' | 'assistant',
          timestamp: msg.timestamp
        }))

      console.log(`📥 ${messages.length} messages récupérés depuis Supabase`)
      return messages

    } catch (error) {
      console.error('❌ Erreur getMessagesForAI:', error)
      return []
    }
  }

  // ================ GESTION DU CONTEXTE IA ================

  /**
   * Sauvegarder le contexte IA (en mémoire temporaire)
   */
  async saveAIContext(sessionId: string, context: AIContext): Promise<void> {
    try {
      const contextWithTimestamp = {
        ...context,
        last_updated: new Date().toISOString()
      }

      // Pour l'instant, stocker dans une table Supabase temporaire
      // ou en mémoire côté application
      console.log(`🧠 Contexte IA préparé pour session ${sessionId}:`, contextWithTimestamp)
      
      // TODO: Implémenter le stockage Redis quand les foreign tables seront fonctionnelles
      
    } catch (error) {
      console.error('❌ Erreur saveAIContext:', error)
    }
  }

  /**
   * Récupérer le contexte IA 
   */
  async getAIContext(sessionId: string): Promise<AIContext | null> {
    try {
      // Pour l'instant, retourner un contexte vide
      // TODO: Implémenter la récupération Redis
      console.log(`🧠 Récupération contexte IA pour session ${sessionId}`)
      
      return {
        summary: '',
        user_preferences: {},
        conversation_state: 'active',
        topics: [],
        last_updated: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Erreur getAIContext:', error)
      return null
    }
  }

  // ================ UTILITAIRES ================

  /**
   * Tester la connexion Redis via Supabase
   */
  async testRedisConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('test_redis_connection')

      if (error) {
        console.error('Erreur test Redis:', error)
        return false
      }

      return data === true

    } catch (error) {
      console.error('❌ Test connexion Redis échoué:', error)
      return false
    }
  }

  /**
   * Obtenir des statistiques Redis
   */
  async getRedisStats(): Promise<{
    isConnected: boolean
    totalSessions: number
    totalMessages: number
    error?: string
  }> {
    try {
      // Test de base
      const isConnected = await this.testRedisConnection()
      
      if (!isConnected) {
        return {
          isConnected: false,
          totalSessions: 0,
          totalMessages: 0,
          error: 'Connexion Redis indisponible'
        }
      }

      // Obtenir les statistiques détaillées
      const { data, error } = await this.supabase
        .rpc('get_redis_simple_stats')

      if (error) {
        return {
          isConnected: false,
          totalSessions: 0,
          totalMessages: 0,
          error: error.message
        }
      }

      const stats = data || {}
      return {
        isConnected: stats.connection_status === 'connected',
        totalSessions: stats.sessions_count || 0,
        totalMessages: stats.ai_contexts_count || 0
      }

    } catch (error) {
      return {
        isConnected: false,
        totalSessions: 0,
        totalMessages: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  /**
   * Tester toutes les tables Redis
   */
  async testAllRedisTablesConnection(): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .rpc('test_all_redis_tables')

      if (error) {
        console.error('Erreur test tables Redis:', error)
        return { error: error.message }
      }

      return data || { error: 'Pas de données retournées' }

    } catch (error) {
      console.error('❌ Erreur test complet Redis:', error)
      return { error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  /**
   * Récupérer les sessions avec messages depuis Redis
   */
  async getRedisSessionsWithMessages(): Promise<Array<{
    session_key: string
    message_count: number
    messages: any[]
  }>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_redis_sessions_with_messages')

      if (error) {
        console.warn('Erreur récupération sessions Redis:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('❌ Erreur getRedisSessionsWithMessages:', error)
      return []
    }
  }

  /**
   * Préparer le contexte pour n8n
   */
  async prepareContextForAI(sessionId: string): Promise<{
    message_history: ChatMessage[]
    ai_context: AIContext | null
    session_metadata: Record<string, any>
  }> {
    try {
      const [messageHistory, aiContext] = await Promise.all([
        this.getMessagesForAI(sessionId, 10),
        this.getAIContext(sessionId)
      ])

      const sessionMetadata = {
        total_messages: messageHistory.length,
        last_activity: new Date().toISOString(),
        session_id: sessionId
      }

      console.log(`🎯 Contexte IA préparé:`, {
        messages: messageHistory.length,
        hasContext: !!aiContext,
        metadata: sessionMetadata
      })

      return {
        message_history: messageHistory,
        ai_context: aiContext,
        session_metadata: sessionMetadata
      }

    } catch (error) {
      console.error('❌ Erreur préparation contexte IA:', error)
      return {
        message_history: [],
        ai_context: null,
        session_metadata: { error: 'Contexte indisponible' }
      }
    }
  }
}

// ================ WEBHOOK AVEC CONTEXTE IA ================

export async function sendMessageToN8nWithContext(
  sessionId: string,
  userId: string,
  message: string
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const redisManager = new SupabaseRedisManager()
    
    // 1. Préparer le contexte IA
    const context = await redisManager.prepareContextForAI(sessionId)

    // 2. Construire le payload enrichi
    const enrichedPayload = {
      sessionId,
      userId,
      message,
      timestamp: new Date().toISOString(),
      context
    }

    console.log('🚀 Envoi webhook n8n avec contexte:', {
      sessionId,
      userId,
      messageLength: message.length,
      historyCount: context.message_history.length
    })

    // 3. Envoyer à n8n
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER || 'admin'
    const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || 'v7Efb2!h@A6RxP'

    if (!webhookUrl) {
      throw new Error('URL webhook n8n non configurée')
    }

    const basicAuth = 'Basic ' + btoa(`${username}:${password}`)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
        'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'User-Agent': 'ChatApp/1.0',
      },
      body: JSON.stringify(enrichedPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur webhook n8n: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Réponse n8n reçue:', result)

    return { success: true, data: result }

  } catch (error) {
    console.error('❌ Erreur webhook n8n:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'