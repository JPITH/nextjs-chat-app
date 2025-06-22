// src/app/chat/[sessionId]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeaderSupabase } from '@/components/layout/HeaderSupabase';
import { ChatInterfaceSupabase } from '@/components/chat/ChatInterfaceSupabase';

interface ChatPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Unwrap params avec React.use()
  const { sessionId } = use(params);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Redirection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderSupabase />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <div className="h-[calc(100vh-4rem)] bg-white shadow-sm">
            <ChatInterfaceSupabase sessionId={sessionId} />
          </div>
        </div>
      </main>
    </div>
  );
}