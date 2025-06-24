// src/app/books/[bookId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeaderSupabase } from '@/components/layout/Header';
import ChatInterface from '@/components/chat/ChatInterface';

interface BookPageProps {
  params: Promise<{ bookId: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        setBookId(resolvedParams.bookId);
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadParams();
  }, [params, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }
  
  if (!bookId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Livre introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderSupabase />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <div className="h-[calc(100vh-4rem)] bg-white shadow-sm">
            <ChatInterface bookId={bookId} />
          </div>
        </div>
      </main>
    </div>
  );
}