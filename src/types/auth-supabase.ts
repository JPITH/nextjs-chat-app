// src/types/auth-supabase.ts
export interface User {
    id: string
    email: string
    name?: string
    created_at: string
  }
  
  export interface AuthResponse {
    success: boolean
    user?: User
    message?: string
  }