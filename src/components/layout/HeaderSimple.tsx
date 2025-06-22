// src/components/layout/HeaderSimple.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeaderSimple() {
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
            <Link href="/auth/signin">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Inscription</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}