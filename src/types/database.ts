// src/types/database.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
        };
        Update: {
          name?: string | null;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          genre: string | null;
          target_words: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          genre?: string | null;
          target_words?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          genre?: string | null;
          target_words?: number | null;
          updated_at?: string;
        };
      };
      book_chat: {
        Row: {
          id: string;
          book_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          book_id: string;
          title: string;
          content: string;
        };
        Update: {
          title?: string;
          content?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export interface User {
    id: string;
    email: string;
    name?: string;
    user_metadata?: {
      name?: string;
    };
  }
  
  export interface Book {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    genre?: string;
    target_words?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface BookMessage {
    id: string;
    book_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface BookStats {
    total_messages: number;
    word_count: number;
    user_words: number;
    estimated_pages: number;
  }
  
  export interface WebhookPayload {
    bookId: string;
    message: string;
    userId?: string;
    timestamp?: string;
    templateId?: string;
    templateName?: string;
    genre?: string;
  }
  
  export interface WebhookResponse {
    success: boolean;
    message?: string;
    data?: any;
    aiResponseSaved?: boolean;
    savedAIResponse?: {
      id: string;
      content: string;
      timestamp: string;
    };
    requestId?: string;
  }