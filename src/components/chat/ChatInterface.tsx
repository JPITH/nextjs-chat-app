// src/components/chat/ChatInterface.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/Button';
import type { BookMessage, Book, BookStats } from '@/types/database';

interface ChatInterfaceProps {
  bookId: string;
}

export default function ChatInterface({ bookId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<BookMessage[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [stats, setStats] = useState<BookStats>({
    total_messages: 0,
    word_count: 0,
    user_words: 0,
    estimated_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const componentMountedRef = useRef(true);

  const calculateStats = useCallback((messages: BookMessage[]) => {
    const userMessages = messages.filter(m => 
      m.title?.toLowerCase().includes('utilisateur')
    );
    
    const totalWords = messages.reduce((acc, msg) => 
      acc + msg.content.split(' ').length, 0
    );
    
    const userWords = userMessages.reduce((acc, msg) => 
      acc + msg.content.split(' ').length, 0
    );

    return {
      total_messages: messages.length,
      word_count: totalWords,
      user_words: userWords,
      estimated_pages: Math.ceil(userWords / 250)
    };
  }, []);

  const fetchBook = useCallback(async () => {
    if (!user) return;

    try {
      const { data: bookData, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        router.push('/dashboard');
        return;
      }

      if (componentMountedRef.current) {
        setBook(bookData);
      }
    } catch (error) {
      router.push('/dashboard');
    }
  }, [bookId, user, router, supabase]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('book_chat')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const msgs = messagesData || [];
      
      if (componentMountedRef.current) {
        setMessages(msgs);
        setStats(calculateStats(msgs));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      if (componentMountedRef.current) {
        setLoading(false);
      }
    }
  }, [bookId, user, supabase, calculateStats]);

  useEffect(() => {
    componentMountedRef.current = true;
    fetchBook();
    fetchMessages();

    return () => {
      componentMountedRef.current = false;
    };
  }, [fetchBook, fetchMessages]);

  useEffect(() => {
    if (!user || !bookId) return;

    const channel = supabase
      .channel(`book_messages_${bookId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'book_chat',
          filter: `book_id=eq.${bookId}`,
        },
        (payload) => {
          const newMessage = payload.new as BookMessage;
          
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            const updatedMessages = [...prev, newMessage];
            setStats(calculateStats(updatedMessages));
            
            if (newMessage.title?.toLowerCase().includes('assistant')) {
              setWaitingForAI(false);
            }
            
            return updatedMessages;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, bookId, supabase, calculateStats]);

  const handleSendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    setSending(true);
    setWaitingForAI(true);
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      // Le message sera ajouté via WebSocket
    } catch (error) {
      console.error('Error sending message:', error);
      setWaitingForAI(false);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const exportBook = async () => {
    const userContent = messages
      .filter(m => m.title?.toLowerCase().includes('utilisateur'))
      .map(m => m.content)
      .join('\n\n');

    const blob = new Blob([userContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book?.title || 'livre'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {book?.title || 'Mon livre'}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>📝 {stats.user_words} mots</span>
              <span>📄 {stats.estimated_pages} pages</span>
              <span>💬 {stats.total_messages} échanges</span>
              
              {waitingForAI && (
                <div className="flex items-center space-x-1">
                  <span className="animate-pulse">🤖</span>
                  <span className="text-xs text-blue-600">Assistant réfléchit...</span>
                </div>
              )}
            </div>

            {book?.target_words && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progression</span>
                  <span>{Math.round((stats.user_words / book.target_words) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.user_words / book.target_words) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportBook}
              disabled={stats.user_words === 0}
            >
              📤 Exporter
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              ← Retour
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <MessageList messages={messages} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
        placeholder={
          waitingForAI 
            ? "⏳ Assistant en train de répondre..." 
            : "Demandez de l'aide à votre assistant d'écriture..."
        }
      />
    </div>
  );
}