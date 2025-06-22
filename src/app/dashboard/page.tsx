// src/app/dashboard/page.tsx (version Supabase)
'use client'

import React from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { HeaderSupabase } from '@/components/layout/HeaderSupabase'
import { SessionsListSupabase } from '@/components/dashboard/SessionsListSupabase'

export default function DashboardPage() {
  const { user, loading } = useAuth()

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
        <SessionsListSupabase />
      </main>
    </div>
  )
}