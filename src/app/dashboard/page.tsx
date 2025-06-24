// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Header } from '@/components/layout/Header';
import { BooksList } from '@/components/dashboard/BooksList';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {user.user_metadata?.name || 'Auteur'} ! 👋
          </h1>
          <p className="text-gray-600">
            Prêt à écrire votre prochain chef-d'œuvre ? Choisissez un assistant spécialisé pour vous guider.
          </p>
        </div>
        <BooksList />
      </main>
    </div>
  );
}