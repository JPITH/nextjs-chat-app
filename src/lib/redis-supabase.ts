// Fichier supprimé : Redis n'est plus utilisé

  
  /**
   * Sauvegarder un message dans Redis ET Supabase
   */
  async saveMessage(message: {
    id: string
    session_id: string
    content: string
    sender: 'user' | 'assistant'
    timestamp: string
  }) {
    try {
      // 1. Sauvegarder en Supabase (base principale)
      const { error: supabaseError } = await this.supabase
        .from('chat_messages')
        .insert(message)

      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError)
        throw supabaseError
      }

      // 2. Sauvegarder en Redis (pour la mémoire IA et performance)
      const redisKey = `session:${message.session_id}:messages`
      
      // Ajouter le message à la liste Redis
      const { error: redisError } = await this.supabase
        .rpc('redis_lpush', {
          wrapper_name: this.wrapperName,
          key: redisKey,
          value: JSON.stringify({
            id: message.id,
            content: message.content,
            sender: message.sender,
            timestamp: message.timestamp,
            session_id: message.session_id
          })
        })

      if (redisError) {
        console.warn('Erreur Redis (non critique):', redisError)
      }

      // 3. Mettre à jour les métadonnées de session en Redis
      await this.updateSessionMetadata(message.session_id)

      return { success: true }
    } catch (error) {
      console.error('Erreur saveMessage:', error)
      throw error
    }
  }

  /**
   * Récupérer l'historique des messages depuis Redis (pour l'IA)
   */
  async getMessagesForAI(sessionId: string, limit: number = 20): Promise<any[]> {
    try {
      const redisKey = `session:${sessionId}:messages`
      
      const { data, error } = await this.supabase
        .rpc('redis_lrange', {
          wrapper_name: this.wrapperName,
          key: redisKey,
          start: 0,
          stop: limit - 1
        })

      if (error) {
        console.warn('Erreur Redis, fallback Supabase:', error)
        return await this.getMessagesFromSupabase(sessionId, limit)
      }

      return (data || [])
        .map((item: string) => {
          try {
            return JSON.parse(item)
          } catch {
            return null
          }
        })
        .filter(Boolean)
        .reverse() // Ordre chronologique

    } catch (error) {
      console.error('Erreur getMessagesForAI:', error)
      // Fallback sur Supabase
      return await this.getMessagesFromSupabase(sessionId, limit)
    }
  }

  /**
   * Fallback : récupérer depuis Supabase
   */
  private async getMessagesFromSupabase(sessionId: string, limit: number = 20) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).reverse()
  }

  /**
   * Mettre à jour les métadonnées de session
   */
  private async updateSessionMetadata(sessionId: string) {
    try {
      const metadataKey = `session:${sessionId}:metadata`
      
      await this.supabase
        .rpc('redis_hset_multiple', {
          wrapper_name: this.wrapperName,
          key: metadataKey,
          fields: {
            last_activity: new Date().toISOString(),
            message_count_redis: '1' // Sera incrémenté
          }
        })

      // Incrémenter le compteur
      await this.supabase
        .rpc('redis_hincrby', {
          wrapper_name: this.wrapperName,
          key: metadataKey,
          field: 'message_count_redis',
          increment: 1
        })

    } catch (error) {
      console.warn('Erreur mise à jour métadonnées Redis:', error)
    }
  }

  // ================ GESTION DE LA MÉMOIRE IA ================

  /**
   * Sauvegarder le contexte IA dans Redis
   */
  async saveAIContext(sessionId: string, context: {
    summary?: string
    user_preferences?: Record<string, any>
    conversation_state?: string
    topics?: string[]
  }) {
    try {
      const contextKey = `session:${sessionId}:ai_context`
      
      const { error } = await this.supabase
        .rpc('redis_hset_multiple', {
          wrapper_name: this.wrapperName,
          key: contextKey,
          fields: {
            summary: context.summary || '',
            user_preferences: JSON.stringify(context.user_preferences || {}),
            conversation_state: context.conversation_state || '',
            topics: JSON.stringify(context.topics || []),
            updated_at: new Date().toISOString()
          }
        })

      if (error) {
        console.error('Erreur sauvegarde contexte IA:', error)
      }

    } catch (error) {
      console.error('Erreur saveAIContext:', error)
    }
  }

  /**
   * Récupérer le contexte IA depuis Redis
   */
  async getAIContext(sessionId: string) {
    try {
      const contextKey = `session:${sessionId}:ai_context`
      
      const { data, error } = await this.supabase
        .rpc('redis_hgetall', {
          wrapper_name: this.wrapperName,
          key: contextKey
        })

      if (error || !data) {
        return null
      }

      return {
        summary: data.summary || '',
        user_preferences: data.user_preferences ? JSON.parse(data.user_preferences) : {},
        conversation_state: data.conversation_state || '',
        topics: data.topics ? JSON.parse(data.topics) : [],
        updated_at: data.updated_at
      }

    } catch (error) {
      console.error('Erreur getAIContext:', error)
      return null
    }
  }

  // ================ SYNCHRONISATION ================

  /**
   * Synchroniser Redis avec Supabase (à exécuter périodiquement)
   */
  async syncRedisWithSupabase(sessionId: string) {
    try {
      // 1. Récupérer les messages récents de Supabase
      const { data: recentMessages, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error

      // 2. Nettoyer et repeupler Redis
      const redisKey = `session:${sessionId}:messages`
      
      // Supprimer l'ancienne liste
      await this.supabase
        .rpc('redis_del', {
          wrapper_name: this.wrapperName,
          key: redisKey
        })

      // Ajouter les messages dans l'ordre chronologique
      for (const message of (recentMessages || []).reverse()) {
        await this.supabase
          .rpc('redis_lpush', {
            wrapper_name: this.wrapperName,
            key: redisKey,
            value: JSON.stringify({
              id: message.id,
              content: message.content,
              sender: message.sender,
              timestamp: message.timestamp,
              session_id: message.session_id
            })
          })
      }

      console.log(`Synchronisation Redis terminée pour session ${sessionId}`)

    } catch (error) {
      console.error('Erreur synchronisation:', error)