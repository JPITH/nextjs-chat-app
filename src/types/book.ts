// src/types/book.ts
export interface Book {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    chapter_count: number;
  }
  
  export interface BookMessage {
    id: string;
    book_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateBookRequest {
    title: string;
    description?: string;
  }
  
  export interface SendMessageRequest {
    message: string;
    bookId: string;
  }
  
  export interface WebhookPayload {
    bookId: string;
    message: string;
    userId?: string;
    timestamp: string;
  }
  
  export interface WebhookResponse {
    bookId: string;
    response: string;
    timestamp: string;
  }