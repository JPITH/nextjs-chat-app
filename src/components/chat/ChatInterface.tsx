// src/components/chat/ChatInterface.tsx - WhatsApp Style Bleu + Tailwind
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
        router.push('/dashboard');
        return;
      }

      setBook(bookData);
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

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, user, supabase]);

  useEffect(() => {
    fetchBook();
    fetchMessages();
  }, [fetchBook, fetchMessages]);

  // WebSocket pour les nouveaux messages
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
          console.log('📨 Nouveau message WebSocket:', newMessage.title, newMessage.content.substring(0, 50));
          
          setMessages((prev) => {
            // Éviter les doublons
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 WebSocket status:', status);
      });

    return () => {
      console.log('🔌 Déconnexion WebSocket');
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
        throw new Error('Erreur lors de l\'envoi');
      }

      console.log('✅ Message envoyé avec succès');

    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      setNewMessage(messageToSend); // Restore message on error
      alert('Erreur lors de l\'envoi du message');
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
    return message.title?.toLowerCase().includes('utilisateur');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 md:max-w-4xl md:mx-auto md:mt-4 md:h-[calc(100vh-2rem)] md:rounded-lg md:shadow-lg md:overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 md:p-4 flex items-center space-x-3 shadow-sm">
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-lg md:text-xl">
          📖
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm md:text-base truncate">
            {book?.title || 'Mon livre'}
          </h1>
          <div className="flex items-center text-blue-100 text-xs md:text-sm">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 px-4">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">💬</div>
              <p className="text-sm md:text-base">Commencez la conversation avec votre assistant</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {messages.map((message) => {
              const isUser = isUserMessage(message);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm transition-all hover:shadow-md ${
                      isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                    }`}
                  >
                    <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isUser ? 'text-blue-100 text-right' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-3 md:p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 md:py-3 flex items-center min-h-[40px] md:min-h-[48px]">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder-gray-500"
              disabled={sending}
            />
            <div className="flex items-center space-x-1 ml-2">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 send-button ${
              newMessage.trim() && !sending
                ? 'bg-blue-500 hover:bg-blue-600 scale-100 shadow-md hover:shadow-lg'
                : 'bg-gray-400 scale-95 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}