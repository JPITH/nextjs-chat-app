// src/components/layout/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              ChatApp
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}