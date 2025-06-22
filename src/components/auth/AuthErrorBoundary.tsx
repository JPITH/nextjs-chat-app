// src/components/auth/AuthErrorBoundary.tsx
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cleanupCorruptedSession } from '@/lib/auth-supabase'

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const router = useRouter()

  useEffect(() => {
    // Écouter les erreurs globales d'authentification
    const handleAuthError = async (event: ErrorEvent) => {
      const error = event.error
      
      if (error?.message?.includes('User from sub claim in JWT does not exist') ||
          error?.message?.includes('Invalid JWT') ||
          error?.message?.includes('JWT expired')) {
        
        console.warn('Erreur d\'authentification détectée, nettoyage en cours...')
        
        try {
          await cleanupCorruptedSession()
          // Rediriger vers la page de connexion
          router.push('/auth/signin?message=session-expired')
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError)
          // Forcer la redirection même en cas d'erreur
          window.location.href = '/auth/signin?message=session-expired'
        }
      }
    }

    // Écouter les erreurs de rejet de promesse non gérées
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      if (error?.message?.includes('User from sub claim in JWT does not exist') ||
          error?.message?.includes('Invalid JWT') ||
          error?.message?.includes('JWT expired')) {
        
        console.warn('Erreur d\'authentification dans une promesse, nettoyage en cours...')
        
        try {
          await cleanupCorruptedSession()
          router.push('/auth/signin?message=session-expired')
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError)
          window.location.href = '/auth/signin?message=session-expired'
        }
      }
    }

    window.addEventListener('error', handleAuthError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleAuthError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router])

  return <>{children}</>
}