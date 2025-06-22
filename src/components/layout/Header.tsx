// src/components/layout/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  user?: {
    email: string;
    name?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth-token');
    // Remove token from cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

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
                  {user.name || user.email}
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
  );
}