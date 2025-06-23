// src/components/auth/AuthProvider.tsx (corrigé)
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Récupérer l'utilisateur actuel avec gestion d'erreur améliorée
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          // Si l'erreur indique que l'utilisateur n'existe pas, nettoyer la session
          if (error.message.includes('User from sub claim in JWT does not exist') || 
              error.message.includes('Invalid JWT') ||
              error.message.includes('JWT expired')) {
            console.warn('Session invalide détectée, nettoyage en cours...')
            await supabase.auth.signOut()
            setUser(null)
          } else if (error.message !== 'Auth session missing!') {
            console.error('Erreur auth:', error)
          }
        } else {
          setUser(user)
        }
      } catch (error: unknown) {
        console.error('Erreur récupération utilisateur:', error)
        // En cas d'erreur critique, nettoyer la session
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('Erreur lors du nettoyage de session:', signOutError)
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification avec gestion d'erreur WebSocket
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      try {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            setUser(null)
          } else if (session?.user) {
            setUser(session.user)
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'événement auth:', error)
        // Ne pas faire échouer l'app à cause d'erreurs WebSocket
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}