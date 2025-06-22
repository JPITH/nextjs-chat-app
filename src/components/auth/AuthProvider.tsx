// src/components/auth/AuthProvider.tsx (version améliorée)
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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

    // Récupérer l'utilisateur actuel avec gestion d'erreur
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // Ne pas traiter comme une erreur si pas de session
        if (error && error.message !== 'Auth session missing!') {
          console.error('Erreur auth:', error)
        }
        
        setUser(user)
      } catch (error: any) {
        // Ignorer l'erreur "Auth session missing" qui est normale
        if (error.message !== 'Auth session missing!') {
          console.error('Erreur récupération utilisateur:', error)
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Logger uniquement les événements importants
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('Auth event:', event, session?.user?.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}