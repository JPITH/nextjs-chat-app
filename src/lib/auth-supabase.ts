// src/lib/auth-supabase.ts (version avec gestion d'erreur améliorée)
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
    try {
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
        // Ne pas faire échouer l'inscription si le profil ne peut pas être créé
      }
    } catch (profileError) {
      console.error('Erreur lors de la création du profil:', profileError)
    }
  }

  return data
}

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Gestion du "Se souvenir de moi"
  if (!rememberMe && data.session) {
    // Stocker un timestamp d'expiration dans localStorage
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000) // 1 jour en millisecondes
    localStorage.setItem('auth-expiration', expirationTime.toString())
    
    // Programmer la déconnexion automatique
    setTimeout(async () => {
      await signOut()
      window.location.href = '/auth/signin?message=session-expired'
    }, 24 * 60 * 60 * 1000) // 1 jour
  } else {
    // Si "Se souvenir de moi" est coché, supprimer l'expiration
    localStorage.removeItem('auth-expiration')
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  try {
    // Nettoyer localStorage
    localStorage.removeItem('auth-expiration')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Même en cas d'erreur, nettoyer le localStorage
      localStorage.clear()
    }
  } catch (error) {
    console.error('Erreur critique lors de la déconnexion:', error)
    // Forcer le nettoyage du localStorage
    localStorage.clear()
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  
  try {
    // Vérifier l'expiration de session si elle existe
    const expirationTime = localStorage.getItem('auth-expiration')
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      // Session expirée, déconnecter
      await signOut()
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Si l'utilisateur n'existe plus, nettoyer la session
      if (error.message.includes('User from sub claim in JWT does not exist') ||
          error.message.includes('Invalid JWT')) {
        console.warn('Utilisateur invalide détecté, nettoyage de la session...')
        await signOut()
        return null
      }
      
      if (error.message !== 'Auth session missing!') {
        console.error('Erreur récupération utilisateur:', error)
      }
      return null
    }
    
    return user
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

export async function getSession() {
  const supabase = createClient()
  
  try {
    // Vérifier l'expiration de session si elle existe
    const expirationTime = localStorage.getItem('auth-expiration')
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      // Session expirée, déconnecter
      await signOut()
      return null
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erreur récupération session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return null
  }
}

// Fonction utilitaire pour vérifier l'expiration au chargement de l'app
export function checkSessionExpiration() {
  const expirationTime = localStorage.getItem('auth-expiration')
  if (expirationTime && Date.now() > parseInt(expirationTime)) {
    signOut()
    return false
  }
  return true
}

// Fonction pour nettoyer une session corrompue
export async function cleanupCorruptedSession() {
  const supabase = createClient()
  
  try {
    await supabase.auth.signOut()
    localStorage.clear()
    console.log('Session corrompue nettoyée')
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error)
    // Forcer le nettoyage du localStorage même en cas d'erreur
    localStorage.clear()
  }
}