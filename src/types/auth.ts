// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
  }
  
  export interface AuthPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
  }
  
  export interface SignInRequest {
    email: string;
    password: string;
  }
  
  export interface SignUpRequest {
    email: string;
    password: string;
    name?: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
  }