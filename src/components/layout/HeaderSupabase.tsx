// src/components/layout/HeaderSupabase.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { signOut } from '@/lib/auth-supabase'
import { Button } from '@/components/ui/Button'

export function HeaderSupabase() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (loading) {
    return (
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ChatApp
            </Link>
            <div className="text-gray-500">Chargement...</div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ChatApp
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.name || user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Inscription</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}