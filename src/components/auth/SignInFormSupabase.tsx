// src/components/auth/SignInFormSupabase.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export function SignInFormSupabase() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (error: any) {
      // Gestion spécifique de l'erreur "Email not confirmed"
      if (error.message.includes('Email not confirmed')) {
        setError('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.')
      } else {
        setError(error.message || 'Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
              
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              {/* Case à cocher "Se souvenir de moi" */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                  {error.includes('confirmé') && (
                    <div className="mt-2">
                      <Link 
                        href={`/auth/confirm-email?email=${encodeURIComponent(email)}`}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Renvoyer l'email de confirmation
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>

              {/* Lien vers l'inscription */}
              <div className="text-center text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  S'inscrire
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}