// src/types/chat.ts
export interface Message {
    id: string
    content: string
    sender: 'user' | 'assistant'
    timestamp: Date
    sessionId?: string
    book_id?: string
    title?: string
    created_at?: string
  }
  
  export interface ChatSession {
    id: string
    userId: string
    title: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
  }
  
  export interface WebhookPayload {
    bookId: string
    message: string
    userId?: string
    timestamp: string
    templateId?: string
    templateName?: string
    genre?: string
  }
  
  export interface WebhookResponse {
    sessionId?: string
    bookId?: string
    response: string
    timestamp?: string
    success?: boolean
    data?: any
    aiResponseSaved?: boolean
    savedAIResponse?: {
      id: string
      content: string
      timestamp: string
    }
    requestId?: string
    debug?: any
  }