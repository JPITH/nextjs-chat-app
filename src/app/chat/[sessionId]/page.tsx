// src/app/chat/[sessionId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { User } from '@/types/auth';

interface ChatPageProps {
  params: {
    sessionId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { sessionId } = params;

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    // Decode token to get user info (simplified)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.userId,
        email: payload.email,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Invalid token:', error);
      router.push('/auth/signin');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <div className="h-[calc(100vh-4rem)] bg-white shadow-sm">
            <ChatInterface sessionId={sessionId} />
          </div>
        </div>
      </main>
    </div>
  );
}