// src/lib/jwt.ts
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export function signToken(payload: Pick<TokenPayload, 'userId' | 'email'>): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  try {
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}