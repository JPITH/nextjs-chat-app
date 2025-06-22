// src/app/auth/confirm-email/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface ConfirmEmailPageProps {
  searchParams: {
    email?: string
  }
}

export default function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const email = searchParams.email

  const resendConfirmation = async () => {
    if (!email) return

    setIsResending(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMessage('Email de confirmation renvoyé avec succès!')
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <CardTitle>Vérifiez votre email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Nous avons envoyé un lien de confirmation à :
            </p>
            <p className="font-semibold text-gray-900">
              {email || 'votre adresse email'}
            </p>
            <p className="text-sm text-gray-500">
              Cliquez sur le lien dans l'email pour activer votre compte. 
              Si vous ne voyez pas l'email, vérifiez votre dossier spam.
            </p>

            {message && (
              <div className={`text-sm p-3 rounded-lg ${
                message.includes('Erreur') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-3">
              {email && (
                <Button
                  onClick={resendConfirmation}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
                </Button>
              )}

              <Link href="/auth/signin">
                <Button variant="ghost" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}