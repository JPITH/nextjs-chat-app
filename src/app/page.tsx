// src/app/dashboard/page.tsx - Version mise à jour
'use client'

import React from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { HeaderSupabase } from '@/components/layout/HeaderSupabase'
import { BooksListSupabase } from '@/components/dashboard/BooksListSupabase'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSupabase />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête avec message de bienvenue */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {user.user_metadata?.name || 'Auteur'} ! 👋
          </h1>
          <p className="text-gray-600">
            Prêt à écrire votre prochain chef-d'œuvre ? Choisissez un assistant spécialisé pour vous guider.
          </p>
        </div>

        {/* Liste des livres avec nouveau système */}
        <BooksListSupabase />

        {/* Section informative */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            ✨ Nouveauté : Assistants d'écriture spécialisés
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-medium text-gray-900 mb-1">Expert dédié</h3>
              <p className="text-gray-600">Chaque type de livre a son assistant spécialisé avec une expertise unique</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900 mb-1">Guide complet</h3>
              <p className="text-gray-600">Recevez immédiatement un plan détaillé adapté à votre projet</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-medium text-gray-900 mb-1">Démarrage rapide</h3>
              <p className="text-gray-600">Plus besoin de chercher par où commencer, votre assistant s'en charge</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}