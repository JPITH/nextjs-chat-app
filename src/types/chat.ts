// src/types/chat.ts
export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    sessionId: string;
  }
  
  export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
  }
  
  export interface SendMessageRequest {
    message: string;
    sessionId: string;
  }
  
  export interface WebhookPayload {
    sessionId: string;
    message: string;
    userId: string;
    timestamp: string;
  }
  
  export interface WebhookResponse {
    sessionId: string;
    response: string;
    timestamp: string;
  }