

    if (this.isConnecting) {
      // Wait for connection to complete
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client?.isReady) {
        return this.client;
      }
    }

    this.isConnecting = true;

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        // Fichier supprimé : Redis n'est plus utilisé
      });

      await this.client.connect();
      this.isConnecting = false;
      return this.client;
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    const client = await this.getClient();
    await client.hSet(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: user.createdAt.toISOString(),
    });
  }

  async getUser(userId: string): Promise<User | null> {
    const client = await this.getClient();
    const userData = await client.hGetAll(`user:${userId}`);
    
    if (!userData.id) return null;

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name || undefined,
      createdAt: new Date(userData.createdAt),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await this.getClient();
    const userId = await client.get(`email:${email}`);
    
    if (!userId) return null;
    return this.getUser(userId);
  }

  async saveUserByEmail(email: string, userId: string): Promise<void> {
    const client = await this.getClient();
    await client.set(`email:${email}`, userId);
  }

  // Chat session operations
  async createChatSession(session: ChatSession): Promise<void> {
    const client = await this.getClient();
    
    // Save session data
    await client.hSet(`session:${session.id}`, {
      id: session.id,
      userId: session.userId,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messageCount: session.messageCount.toString(),
    });

    // Add to user's sessions list
    await client.sAdd(`user:${session.userId}:sessions`, session.id);
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    const client = await this.getClient();
    const sessionData = await client.hGetAll(`session:${sessionId}`);
    
    if (!sessionData.id) return null;

    return {
      id: sessionData.id,
      userId: sessionData.userId,
      title: sessionData.title,
      createdAt: new Date(sessionData.createdAt),
      updatedAt: new Date(sessionData.updatedAt),
      messageCount: parseInt(sessionData.messageCount),
    };
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const client = await this.getClient();
    const sessionIds = await client.sMembers(`user:${userId}:sessions`);
    
    const sessions: ChatSession[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.getChatSession(sessionId);
      if (session) sessions.push(session);
    }

    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    const client = await this.getClient();
    
    // Save message to session's message list
    await client.lPush(`session:${message.sessionId}:messages`, JSON.stringify({
      id: message.id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp.toISOString(),
      sessionId: message.sessionId,
    }));

    // Update session's message count and updatedAt
    await client.hIncrBy(`session:${message.sessionId}`, 'messageCount', 1);
    await client.hSet(`session:${message.sessionId}`, 'updatedAt', new Date().toISOString());
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const client = await this.getClient();
    const messagesData = await client.lRange(`session:${sessionId}:messages`, 0, -1);
    
    return messagesData
      .map(data => {
        try {
          const parsed = JSON.parse(data);
          return {
            id: parsed.id,
            content: parsed.content,
            sender: parsed.sender,
            timestamp: new Date(parsed.timestamp),
            sessionId: parsed.sessionId,
          };
        } catch (error) {
          console.error('Failed to parse message:', error);
          return null;
        }
      })
      .filter((msg): msg is Message => msg !== null)
      .reverse(); // Reverse to get chronological order
  }

  // Password operations
  async saveUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const client = await this.getClient();
    await client.set(`password:${userId}`, hashedPassword);
  }