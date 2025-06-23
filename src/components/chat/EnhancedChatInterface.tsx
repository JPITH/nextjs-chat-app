// src/components/chat/EnhancedChatInterface.tsx - Version avec polling de secours
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient, checkRealtimeStatus } from '@/lib/supabase';
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
  user_words: number;
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
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'polling'>('disconnected');
  const [showStats, setShowStats] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [waitingForAI, setWaitingForAI] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());

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
      estimated_pages: Math.ceil(userWords / 250)
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

  const fetchMessages = useCallback(async (updateLastFetch: boolean = true) => {
    if (!user) return;

    try {
      // Ne récupérer que les messages plus récents si on fait du polling
      const timeFilter = updateLastFetch ? {} : {
        created_at: { gte: lastFetchTimeRef.current.toISOString() }
      };

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
      
      // Vérifier s'il y a de nouveaux messages
      if (msgs.length > lastMessageCount) {
        console.log(`📨 Nouveaux messages détectés: ${msgs.length - lastMessageCount}`);
        setLastMessageCount(msgs.length);
        
        // Si on attendait une réponse IA et qu'on a un nouveau message d'assistant
        if (waitingForAI) {
          const newAssistantMessages = msgs.filter(m => 
            m.title?.toLowerCase().includes('assistant') && 
            new Date(m.created_at) > lastFetchTimeRef.current
          );
          
          if (newAssistantMessages.length > 0) {
            console.log('🤖 Réponse IA reçue !');
            setWaitingForAI(false);
          }
        }
      }

      setMessages(msgs);
      setStats(calculateStats(msgs));
      
      if (updateLastFetch) {
        lastFetchTimeRef.current = new Date();
      }
    } catch (error: unknown) {
      console.error('Unexpected error in fetchMessages:', error);
    } finally {
      if (updateLastFetch) {
        setLoading(false);
      }
    }
  }, [bookId, user, supabase, calculateStats, lastMessageCount, waitingForAI]);

  // Polling de secours pour récupérer les nouveaux messages
  const startPolling = useCallback(() => {
    console.log('🔄 Démarrage du polling de secours');
    setWsStatus('polling');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false); // Sans mettre à jour lastFetchTime
    }, 3000); // Polling toutes les 3 secondes
  }, [fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchBook();
    fetchMessages();
    setLastMessageCount(0);
  }, [fetchBook, fetchMessages]);

  // Configuration du WebSocket avec fallback polling
  useEffect(() => {
    if (!user || !bookId) return;

    let isSubscribed = true;

    const setupConnection = async () => {
      console.log('🔗 Test de la connexion Realtime...');
      
      // Tester d'abord si Realtime est disponible
      const realtimeAvailable = await checkRealtimeStatus();
      
      if (!realtimeAvailable) {
        console.warn('⚠️ Realtime non disponible, passage en mode polling');
        startPolling();
        return;
      }

      // Si Realtime est disponible, configurer WebSocket
      try {
        setWsStatus('connecting');
        
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        const channel = supabase
          .channel(`book_messages_${bookId}`, {
            config: {
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
              if (!isSubscribed) return;
              
              console.log('📨 Message reçu via WebSocket:', payload);
              const newMessage = payload.new as Message;
              
              setMessages((prev) => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                const updated = [...prev, newMessage];
                setStats(calculateStats(updated));
                
                // Si c'est une réponse d'assistant, arrêter l'attente
                if (newMessage.title?.toLowerCase().includes('assistant')) {
                  setWaitingForAI(false);
                }
                
                return updated;
              });
            }
          )
          .subscribe((status) => {
            if (!isSubscribed) return;
            
            console.log('🔌 WebSocket status:', status);
            
            if (status === 'SUBSCRIBED') {
              setWsStatus('connected');
              stopPolling(); // Arrêter le polling si WebSocket fonctionne
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              console.warn('⚠️ WebSocket failed, falling back to polling');
              setWsStatus('disconnected');
              startPolling(); // Fallback vers polling
            }
          });

        channelRef.current = channel;
        
        // Timeout de sécurité pour passer en polling si WebSocket ne fonctionne pas
        setTimeout(() => {
          if (isSubscribed && wsStatus !== 'connected') {
            console.warn('⏰ WebSocket timeout, passage en polling');
            startPolling();
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Erreur configuration WebSocket:', error);
        setWsStatus('disconnected');
        startPolling();
      }
    };

    setupConnection();

    return () => {
      isSubscribed = false;
      stopPolling();
      
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Erreur lors de la fermeture du channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [bookId, user, supabase, calculateStats, startPolling, stopPolling, wsStatus]);

  const handleSendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    setSending(true);
    setWaitingForAI(true); // Commencer à attendre une réponse IA
    
    try {
      console.log('🚀 Envoi message:', message);
      
      // 1. Sauvegarder le message utilisateur
      const userMessage = {
        book_id: bookId,
        title: 'Message utilisateur',
        content: message.trim(),
      };

      const { data: savedMessage, error: messageError } = await supabase
        .from('book_chat')
        .insert(userMessage)
        .select()
        .single();

      if (messageError) {
        console.error('❌ Erreur sauvegarde message:', messageError);
        setWaitingForAI(false);
        alert('Erreur lors de la sauvegarde du message');
        return;
      }

      console.log('✅ Message sauvegardé:', savedMessage.id);

      // Mettre à jour immédiatement l'interface
      const updated = [...messages, savedMessage];
      setMessages(updated);
      setStats(calculateStats(updated));
      setLastMessageCount(updated.length);

      // 2. Appel à l'API pour déclencher n8n
      try {
        console.log('🔗 Appel webhook n8n...');
        const response = await fetch('/api/webhook/n8n', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId,
            message: message.trim(),
            userId: user.id,
          }),
        });

        const result = await response.json();
        console.log('📊 Réponse webhook:', result);

        if (!response.ok) {
          console.warn('⚠️ Webhook n8n a échoué:', result);
          setWaitingForAI(false);
        } else {
          // Si n8n a répondu directement avec une réponse IA
          if (result.success && result.data && 
              (result.data.response || result.data.aiResponse || result.data.message)) {
            
            const aiResponse = result.data.response || result.data.aiResponse || result.data.message;
            console.log('🤖 Réponse IA directe détectée');
            
            const assistantMessage = {
              book_id: bookId,
              title: 'Réponse Assistant',
              content: aiResponse,
            };

            const { data: aiMessage, error: aiError } = await supabase
              .from('book_chat')
              .insert(assistantMessage)
              .select()
              .single();

            if (aiError) {
              console.error('❌ Erreur sauvegarde réponse IA:', aiError);
            } else {
              console.log('✅ Réponse IA sauvegardée:', aiMessage.id);
              setWaitingForAI(false);
              
              // Mettre à jour immédiatement l'interface
              const updatedWithAI = [...updated, aiMessage];
              setMessages(updatedWithAI);
              setStats(calculateStats(updatedWithAI));
              setLastMessageCount(updatedWithAI.length);
            }
          } else {
            // Sinon, la réponse arrivera via WebSocket/polling
            console.log('⏳ En attente de la réponse IA via realtime...');
            
            // Timeout de sécurité pour arrêter l'attente après 60 secondes
            setTimeout(() => {
              if (waitingForAI) {
                console.warn('⏰ Timeout attente réponse IA');
                setWaitingForAI(false);
              }
            }, 60000);
          }
        }

      } catch (webhookError: any) {
        console.error('💥 Erreur webhook n8n:', webhookError);
        setWaitingForAI(false);
      }

    } catch (error: any) {
      console.error('💥 Error sending message:', error);
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

  const getConnectionStatus = () => {
    if (wsStatus === 'connected') return { icon: '🟢', text: 'WebSocket connecté', color: 'text-green-600' };
    if (wsStatus === 'polling') return { icon: '🟡', text: 'Mode polling actif', color: 'text-yellow-600' };
    if (wsStatus === 'connecting') return { icon: '🔄', text: 'Connexion...', color: 'text-blue-600' };
    return { icon: '🔴', text: 'Déconnecté', color: 'text-red-600' };
  };

  const connectionStatus = getConnectionStatus();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Chargement de votre livre...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec informations */}
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
              
              {/* Statut de connexion amélioré */}
              <div className="flex items-center space-x-1">
                <span>{connectionStatus.icon}</span>
                <span className={`text-xs ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </span>
              </div>
              
              {/* Indicateur d'attente IA */}
              {waitingForAI && (
                <div className="flex items-center space-x-1">
                  <span className="animate-pulse">🤖</span>
                  <span className="text-xs text-blue-600">Assistant réfléchit...</span>
                </div>
              )}
            </div>

            {/* Barre de progression */}
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

        {/* Panneau de statistiques */}
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
              <div className="font-medium text-gray-900">Connexion</div>
              <div className={`text-sm font-bold ${connectionStatus.color}`}>
                {connectionStatus.text}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface de chat */}
      <div className="flex-1">
        <MessageListSupabase messages={messages} />
      </div>

      <MessageInputSupabase
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