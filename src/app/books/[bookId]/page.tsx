// src/app/chat/[sessionId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeaderSupabase } from '@/components/layout/HeaderSupabase';
import ChatInterfaceSupabase from '@/components/chat/ChatInterfaceSupabase';
import { createClient } from '@/lib/supabase';

interface BookPageProps {
  params: { bookId: string };
}

export default function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const [book, setBook] = useState<{ title: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookId, setBookId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const resolvedParams = await params;
      if (isMounted) setBookId(resolvedParams.bookId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('books')
        .select('title, description')
        .eq('id', resolvedParams.bookId)
        .single();
      if (!error && data && isMounted) setBook(data);
      if (isMounted) setLoading(false);
    })();
    return () => { isMounted = false; };
  }, [params]);

  if (loading) return <div className="text-gray-500">Chargement...</div>;
  if (!book || !bookId) return <div className="text-red-500">Livre introuvable</div>;

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