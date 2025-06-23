// src/components/chat/EnhancedChatInterface.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import MessageListSupabase from '@/components/chat/MessageListSupabase';
import MessageInputSupabase from '@/components/chat/MessageInputSupabase';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  content: string;
  title: string;
  created_at: string;
  book_id: string;
}

interface Book {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  genre?: string;
  target_words?: number;
  created_at: string;
  updated_at: string;
}

interface BookStats {
  total_messages: number;
  word_count: number;
  estimated_pages: number;
  user_words: number; // Mots écrits par l'utilisateur (non IA)
}

interface EnhancedChatInterfaceProps {
  bookId: string;
}

export default function EnhancedChatInterface({ bookId }: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [stats, setStats] = useState<BookStats>({
    total_messages: 0,
    word_count: 0,
    estimated_pages: 0,
    user_words: 0
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [showStats, setShowStats] = useState(false);
  const [writingMode, setWritingMode] = useState<'chat' | 'focus'>('chat');
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  // Calculer les statistiques en temps réel
  const calculateStats = useCallback((messages: Message[]) => {
    const userMessages = messages.filter(m => 
      m.title?.toLowerCase().includes('utilisateur') || 
      m.title?.toLowerCase().includes('user')
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
      estimated_pages: Math.ceil(userWords / 250) // ~250 mots par page
    };
  }, []);

  const fetchBook = useCallback(async () => {
    if (!user) return;

    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('user_id', user.id)
        .single();

      if (bookError) {
        console.error('Erreur récupération livre:', bookError);
        router.push('/dashboard');
        return;
      }

      setBook(bookData);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  }, [bookId, user, router, supabase]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('book_chat')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      const msgs = messagesData || [];
      setMessages(msgs);
      setStats(calculateStats(msgs));
    } catch (error: unknown) {
      console.error('Unexpected error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, user, supabase, calculateStats]);

  useEffect(() => {
    fetchBook();
    fetchMessages();
  }, [fetchBook, fetchMessages]);

  // Configuration du temps réel
  useEffect(() => {
    if (!user || !bookId) return;

    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtimeSubscription = () => {
      try {
        setWsStatus('connecting');
        
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

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
              const newMessage = payload.new as Message;
              setMessages((prev) => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                const updated = [...prev, newMessage];
                setStats(calculateStats(updated));
                return updated;
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setWsStatus('connected');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setWsStatus('disconnected');
              
              if (retryCount < maxRetries) {
                retryCount++;
                timeoutId = setTimeout(() => {
                  setupRealtimeSubscription();
                }, 2000 * retryCount);
              }
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Erreur configuration WebSocket:', error);
        setWsStatus('disconnected');
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Erreur lors de la fermeture du channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [bookId, user, supabase, calculateStats]);

  const handleSendMessage = async (message: string) => {
    if (!user) return;

    setSending(true);
    try {
      const newMessage = {
        book_id: bookId,
        title: 'Message utilisateur',
        content: message,
      };

      const { data: savedMessage, error: messageError } = await supabase
        .from('book_chat')
        .insert(newMessage)
        .select()
        .single();

      if (messageError) {
        console.error('Erreur sauvegarde message:', messageError);
        return;
      }

      if (wsStatus !== 'connected') {
        const updated = [...messages, savedMessage];
        setMessages(updated);
        setStats(calculateStats(updated));
      }

      // Appel à l'API pour déclencher n8n
      try {
        await fetch('/api/webhook/n8n', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId,
            message,
            userId: user.id,
          }),
        });
      } catch (webhookError) {
        console.error('Erreur webhook n8n:', webhookError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const exportBook = async () => {
    // Extraire uniquement le contenu utilisateur pour l'export
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
        <div className="text-gray-500">Chargement de votre livre...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec informations enrichies */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {book?.title || 'Mon livre'}
            </h1>
            
            {/* Statistiques en temps réel */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center space-x-1">
                <span>📝</span>
                <span>{stats.user_words} mots écrits</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>📄</span>
                <span>{stats.estimated_pages} pages estimées</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>💬</span>
                <span>{stats.total_messages} échanges</span>
              </span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  wsStatus === 'connected' ? 'bg-green-500' : 
                  wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs">
                  {wsStatus === 'connected' ? 'Synchronisé' : 
                   wsStatus === 'connecting' ? 'Synchronisation...' : 'Hors ligne'}
                </span>
              </div>
            </div>

            {/* Barre de progression si objectif défini */}
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
              onClick={() => setWritingMode(writingMode === 'chat' ? 'focus' : 'chat')}
            >
              {writingMode === 'chat' ? '🎯 Mode Focus' : '💬 Mode Chat'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              📊 Stats
            </Button>

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

        {/* Panneau de statistiques détaillées */}
        {showStats && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">Mots utilisateur</div>
              <div className="text-2xl font-bold text-blue-600">{stats.user_words}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Mots total</div>
              <div className="text-2xl font-bold text-gray-600">{stats.word_count}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Pages estimées</div>
              <div className="text-2xl font-bold text-green-600">{stats.estimated_pages}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Échanges IA</div>
              <div className="text-2xl font-bold text-purple-600">{Math.floor(stats.total_messages / 2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Interface adaptative selon le mode */}
      <div className={`flex-1 ${writingMode === 'focus' ? 'bg-gray-50' : ''}`}>
        <MessageListSupabase 
          messages={messages} 
          focusMode={writingMode === 'focus'}
        />
      </div>

      <MessageInputSupabase
        onSendMessage={handleSendMessage}
        disabled={sending}
        placeholder={
          writingMode === 'focus' 
            ? "Continuez votre livre..." 
            : "Demandez de l'aide à votre assistant d'écriture..."
        }
        focusMode={writingMode === 'focus'}
      />
    </div>
  );
}