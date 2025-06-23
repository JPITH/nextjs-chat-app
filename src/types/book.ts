// src/types/book.ts
export interface Book {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  genre?: string;                    // NOUVEAU
  target_words?: number;             // NOUVEAU
  template_id?: string;              // NOUVEAU
  created_at: string;
  updated_at: string;
  // Supprimer chapter_count - non pertinent
}

  export interface BookStats {
  total_messages: number;
  total_words: number;
  user_words: number;                // NOUVEAU - mots écrits par l'utilisateur
  ai_words: number;                  // NOUVEAU - mots de l'IA
  estimated_pages: number;
  completion_percentage: number;     // NOUVEAU - % par rapport à target_words
  last_activity: string;
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