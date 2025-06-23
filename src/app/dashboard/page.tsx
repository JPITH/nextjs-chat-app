// src/app/dashboard/page.tsx (version avec diagnostic Redis)
'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { HeaderSupabase } from '@/components/layout/HeaderSupabase'
import { BooksListSupabase } from '@/components/dashboard/BooksListSupabase'

import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [showRedisDiagnostic, setShowRedisDiagnostic] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Redirection...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSupabase />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toggle pour le diagnostic Redis */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mes livres</h1>
        </div>
        <BooksListSupabase />
      </main>
    </div>
  )
}