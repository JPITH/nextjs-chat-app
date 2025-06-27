// src/components/chat/ChatInterface.tsx - Version corrigée pour PC et mobile
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import type { BookMessage, Book } from '@/types/database';

interface ChatInterfaceProps {
  bookId: string;
}

export default function ChatInterface({ bookId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<BookMessage[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        console.error('Erreur récupération livre:', error);
        router.push('/dashboard');
        return;
      }

      setBook(bookData);
    } catch (error) {
      console.error('Erreur livre:', error);
      router.push('/dashboard');
    }
  }, [bookId, user, router, supabase]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();

      if (response.ok) {
        console.log('📨 Messages récupérés:', data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        console.error('❌ Erreur récupération messages:', data.error);
      }
    } catch (error) {
      console.error('❌ Erreur fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, user]);

  useEffect(() => {
    fetchBook();
    fetchMessages();
  }, [fetchBook, fetchMessages]);

  // WebSocket pour les nouveaux messages avec logs détaillés
  useEffect(() => {
    if (!user || !bookId) return;

    console.log('🔌 Connexion WebSocket pour:', bookId);

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
          console.log('📨 WebSocket - Message reçu:', {
            id: newMessage.id,
            title: newMessage.title,
            content_preview: newMessage.content.substring(0, 50),
            created_at: newMessage.created_at,
            book_id: newMessage.book_id
          });
          
          setMessages((prev) => {
            // Vérifier les doublons avec logs
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('🔄 Message déjà présent, ignoré:', newMessage.id);
              return prev;
            }
            
            console.log('➕ Nouveau message ajouté via WebSocket');
            console.log('📊 Total messages après ajout:', prev.length + 1);
            
            const updated = [...prev, newMessage];
            
            // Log pour debug
            console.log('📋 Liste complète des messages:', updated.map(m => ({
              id: m.id,
              title: m.title,
              preview: m.content.substring(0, 30)
            })));
            
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 WebSocket status détaillé:', {
          status,
          channel: `book_messages_${bookId}`,
          timestamp: new Date().toISOString()
        });
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ WebSocket connecté et prêt à recevoir les messages');
        } else if (status === 'CLOSED') {
          console.log('❌ WebSocket fermé');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur WebSocket channel');
        }
      });

    return () => {
      console.log('🔌 Déconnexion WebSocket pour:', bookId);
      supabase.removeChannel(channel);
    };
  }, [user, bookId, supabase]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setSending(true);
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    
    try {
      console.log('📤 Envoi message:', messageToSend.substring(0, 50));
      
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi');
      }

      const data = await response.json();
      console.log('✅ Message envoyé avec succès:', data);

    } catch (error: any) {
      console.error('❌ Erreur envoi:', error);
      setNewMessage(messageToSend); // Restore message on error
      alert(`Erreur lors de l'envoi: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const isUserMessage = (message: BookMessage) => {
    return message.title?.toLowerCase().includes('utilisateur') || 
           message.title?.toLowerCase().includes('user');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header - Responsive */}
      <div className="bg-blue-600 text-white p-4 flex items-center space-x-3 shadow-sm flex-shrink-0">
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">
          📖
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate">
            {book?.title || 'Mon livre'}
          </h1>
          <div className="flex items-center text-blue-100 text-sm">
            <span>Assistant d'écriture</span>
            <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
            <span className="ml-1">En ligne</span>
          </div>
        </div>

        <button className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>
      </div>

      {/* Messages - Prend tout l'espace disponible */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 px-4">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Commencez la conversation
              </h3>
              <p className="text-gray-500">
                Votre assistant d'écriture vous attend ! Posez votre première question 
                ou demandez de l'aide pour démarrer votre livre.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = isUserMessage(message);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                      isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        isUser ? 'text-blue-100 text-right' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Zone - Reste en bas */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 flex items-center min-h-[48px]">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 resize-none max-h-32"
              disabled={sending}
              rows={1}
              style={{
                minHeight: '24px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            <div className="flex items-center space-x-2 ml-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 send-button ${
              newMessage.trim() && !sending
                ? 'bg-blue-500 hover:bg-blue-600 scale-100 shadow-md hover:shadow-lg'
                : 'bg-gray-400 scale-95 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            )}
          </button>
        </div>
        
        {/* Debug info en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2 text-center">
            Messages: {messages.length} | WebSocket: {bookId ? 'Connecté' : 'Déconnecté'}
          </div>
        )}
      </div>
    </div>
  );
}