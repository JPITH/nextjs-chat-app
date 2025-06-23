// 5. Corriger src/components/chat/ChatInterfaceSupabase.tsx
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
  created_at: string;
  updated_at: string;
  description: string;
}

interface ChatInterfaceSupabaseProps {
  bookId: string;
}

export default function ChatInterfaceSupabase({ bookId }: ChatInterfaceSupabaseProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<any>(null);

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

      setMessages(messagesData || []);
    } catch (error: unknown) {
      console.error('Unexpected error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, user, supabase]);

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
          .channel(`book_messages_${bookId}`, {
            config: {
              broadcast: { self: false },
              presence: { key: user.id }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'book_chat',
              filter: `book_id=eq.${bookId}`,
            },
            (payload) => {
              console.log('Nouveau message reçu:', payload);
              const newMessage = payload.new as Message;
              setMessages((prev) => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
          )
          .subscribe((status) => {
            console.log('Statut WebSocket:', status);
            
            if (status === 'SUBSCRIBED') {
              setWsStatus('connected');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setWsStatus('disconnected');
              
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Tentative de reconnexion ${retryCount}/${maxRetries}...`);
                timeoutId = setTimeout(() => {
                  setupRealtimeSubscription();
                }, 2000 * retryCount);
              }
            } else if (status === 'CLOSED') {
              setWsStatus('disconnected');
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
  }, [bookId, user, supabase]);

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
        setMessages(prev => [...prev, savedMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Chargement de la conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {book?.title || 'Conversation'}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  wsStatus === 'connected' ? 'bg-green-500' : 
                  wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs">
                  {wsStatus === 'connected' ? 'Temps réel' : 
                   wsStatus === 'connecting' ? 'Connexion...' : 'Mode polling'}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>

      <MessageListSupabase messages={messages} />
      <MessageInputSupabase
        onSendMessage={handleSendMessage}
        disabled={sending}
      />
    </div>
  );
}