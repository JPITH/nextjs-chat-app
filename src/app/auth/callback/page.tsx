// src/app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Confirmation en cours...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur callback:', error)
          setMessage('Erreur lors de la confirmation. Veuillez réessayer.')
          setTimeout(() => router.push('/auth/signin'), 3000)
          return
        }

        if (data.session) {
          setMessage('Email confirmé avec succès! Redirection...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setMessage('Session non trouvée. Redirection vers la connexion...')
          setTimeout(() => router.push('/auth/signin'), 3000)
        }
      } catch (error) {
        console.error('Erreur:', error)
        setMessage('Une erreur est survenue. Redirection...')
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}