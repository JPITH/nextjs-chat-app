// src/app/books/[bookId]/page.tsx (corrigé)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeaderSupabase } from '@/components/layout/HeaderSupabase';
import ChatInterfaceSupabase from '@/components/chat/EnhancedChatInterface';
import { createClient } from '@/lib/supabase';

interface BookPageProps {
  params: Promise<{ bookId: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const [book, setBook] = useState<{ title: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookId, setBookId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const loadBookData = async () => {
      try {
        const resolvedParams = await params;
        if (!isMounted) return;
        
        setBookId(resolvedParams.bookId);
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        const supabase = createClient();
        const { data, error } = await supabase
          .from('books')
          .select('title, description')
          .eq('id', resolvedParams.bookId)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Erreur récupération livre:', error);
          router.push('/dashboard');
          return;
        }
        
        if (isMounted) {
          setBook(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
        if (isMounted) {
          router.push('/dashboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBookData();
    
    return () => {
      isMounted = false;
    };
  }, [params, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }
  
  if (!book || !bookId) {
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
            <ChatInterfaceSupabase bookId={bookId} />
          </div>
        </div>
      </main>
    </div>
  );
}