// src/lib/auth-supabase.ts (version moderne)
import { createClient } from './supabase'
import type { User } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || ''
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
  
  // Créer le profil utilisateur si l'inscription réussit
  if (data.user && !error) {
    // Générer un session_id unique (UUID)
    const sessionId = uuidv4();
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: name || null,
        session_id: sessionId
      })
    
    if (profileError) {
      console.error('Erreur création profil:', profileError)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Erreur récupération utilisateur:', error)
    return null
  }
  
  return user
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Erreur récupération session:', error)
    return null
  }
  
  return session
}