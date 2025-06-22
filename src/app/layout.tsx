// src/app/layout.tsx (version avec gestion d'erreur)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatApp - Application de chat intelligente',
  description: 'Une application de chat moderne avec intégration n8n et Redis via Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <AuthErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </AuthErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}