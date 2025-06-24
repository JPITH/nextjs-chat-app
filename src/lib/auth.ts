// src/lib/auth.ts
import { createClient } from './supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const supabase = createClient()
  
  // Vérifier si l'utilisateur existe déjà
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()
  
  if (existingUser) {
    throw new Error('User already exists')
  }
  
  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12)
  
  // Créer l'utilisateur via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || ''
      }
    }
  })
  
  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create user')
  }
  
  // Créer le profil
  const userProfile = {
    id: authData.user.id,
    email,
    name: name || null,
    session_id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert(userProfile)
    .select()
    .single()
  
  if (profileError) {
    console.error('Erreur création profil:', profileError)
    // Ne pas faire échouer si le profil existe déjà
  }
  
  return {
    id: authData.user.id,
    email: authData.user.email!,
    name: name,
    created_at: authData.user.created_at,
    updated_at: new Date().toISOString()
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error || !data.user) {
    return null
  }
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
    created_at: data.user.created_at,
    updated_at: new Date().toISOString()
  }
}