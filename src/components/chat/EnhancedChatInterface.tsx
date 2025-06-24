// 3. Mise à jour de src/components/chat/EnhancedChatInterface.tsx avec debug intégré
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
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [waitingForAI, setWaitingForAI] = useState(false);
  
  // **NOUVEAU: États pour le debug**
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // Refs
  const channelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());
  const isSubscribedRef = useRef(false);
  const componentMountedRef = useRef(true);

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
    if (!user || !componentMountedRef.current) return;

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

      if (componentMountedRef.current) {
        setBook(bookData);
      }
    } catch (error: unknown) {
      console.error('Erreur:', error);
      if (componentMountedRef.current) {
        router.push('/dashboard');
      }
    }
  }, [bookId, user, router, supabase]);

  const fetchMessages = useCallback(async (updateLastFetch: boolean = true) => {
    if (!user || !componentMountedRef.current) return;

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
      
      if (!componentMountedRef.current) return;
      
      // Vérifier s'il y a de nouveaux messages
      if (msgs.length > lastMessageCount) {
        console.log(`📨 Nouveaux messages détectés: ${msgs.length - lastMessageCount}`);
        setLastMessageCount(msgs.length);
        
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
      if (updateLastFetch && componentMountedRef.current) {
        setLoading(false);
      }
    }
  }, [bookId, user, supabase, calculateStats, lastMessageCount, waitingForAI]);

  // **NOUVEAU: Fonctions de debug**
  const addDebugMessage = useCallback(async (content: string, title: string = 'Debug Info') => {
    if (!debugMode) return;
    
    const debugMessage = {
      book_id: bookId,
      title: title,
      content: content,
    };

    try {
      const { data, error } = await supabase
        .from('book_chat')
        .insert(debugMessage)
        .select()
        .single();

      if (!error && componentMountedRef.current) {
        const updated = [...messages, data];
        setMessages(updated);
        setStats(calculateStats(updated));
      }
    } catch (error) {
      console.error('Erreur ajout debug message:', error);
    }
  }, [bookId, supabase, messages, calculateStats, debugMode]);

  const exportLogs = useCallback(async (format: 'json' | 'txt' | 'chat' = 'json') => {
    try {
      const response = await fetch(`/api/webhook/n8n?debug=logs&format=${format}`);
      
      if (format === 'chat') {
        const data = await response.json();
        await addDebugMessage(data.chatMessage, 'Logs Webhook N8N');
      } else {
        // Télécharger le fichier
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `webhook-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur export logs:', error);
    }
  }, [addDebugMessage]);

  const testWebhook = useCallback(async () => {
    try {
      const response = await fetch('/api/webhook/n8n?debug=test');
      const result = await response.json();
      
      if (debugMode) {
        await addDebugMessage(
          `🧪 Test Webhook:\n${JSON.stringify(result, null, 2)}`,
          'Test Webhook'
        );
      }
    } catch (error) {
      console.error('Erreur test webhook:', error);
    }
  }, [addDebugMessage, debugMode]);

  const clearLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/webhook/n8n?debug=clear');
      const result = await response.json();
      
      if (debugMode) {
        await addDebugMessage(
          `🧹 Logs nettoyés: ${result.message}`,
          'Clear Logs'
        );
      }
    } catch (error) {
      console.error('Erreur clear logs:', error);
    }
  }, [addDebugMessage, debugMode]);

  // Fonction pour nettoyer le channel existant
  const cleanupChannel = useCallback(async () => {
    if (channelRef.current) {
      try {
        console.log('🧹 Nettoyage du channel existant...');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      } catch (error) {
        console.error('Erreur lors du nettoyage du channel:', error);
      }
    }
  }, [supabase]);

  // Polling de secours
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    console.log('🔄 Démarrage du polling de secours');
    setWsStatus('polling');
    
    pollingIntervalRef.current = setInterval(() => {
      if (componentMountedRef.current) {
        fetchMessages(false);
      }
    }, 3000);
  }, [fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Configuration WebSocket
  const setupWebSocket = useCallback(async () => {
    if (!user || !bookId || !componentMountedRef.current) return;

    await cleanupChannel();

    try {
      setWsStatus('connecting');
      
      const channelName = `book_messages_${bookId}_${user.id}`;
      console.log(`🔗 Création du channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName, {
          config: {
            presence: { key: user.id }
          }
        });

      channelRef.current = channel;

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'book_chat',
          filter: `book_id=eq.${bookId}`,
        },
        (payload) => {
          if (!componentMountedRef.current) return;
          
          console.log('📨 Message reçu via WebSocket:', payload);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            const updated = [...prev, newMessage];
            setStats(calculateStats(updated));
            
            if (newMessage.title?.toLowerCase().includes('assistant')) {
              setWaitingForAI(false);
            }
            
            return updated;
          });
        }
      );

      if (!isSubscribedRef.current && componentMountedRef.current) {
        console.log('📡 Tentative d\'abonnement au channel...');
        
        channel.subscribe((status) => {
          if (!componentMountedRef.current) return;
          
          console.log('🔌 WebSocket status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ WebSocket connecté avec succès');
            setWsStatus('connected');
            stopPolling();
            isSubscribedRef.current = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('⚠️ WebSocket failed, falling back to polling');
            setWsStatus('disconnected');
            isSubscribedRef.current = false;
            startPolling();
          }
        });
      }

      setTimeout(() => {
        if (componentMountedRef.current && wsStatus !== 'connected') {
          console.warn('⏰ WebSocket timeout, passage en polling');
          startPolling();
        }
      }, 10000);

    } catch (error) {
      console.error('❌ Erreur configuration WebSocket:', error);
      setWsStatus('disconnected');
      startPolling();
    }
  }, [user, bookId, supabase, calculateStats, cleanupChannel, startPolling, stopPolling, wsStatus]);

  // Effets d'initialisation
  useEffect(() => {
    componentMountedRef.current = true;
    
    fetchBook();
    fetchMessages();
    setLastMessageCount(0);

    return () => {
      componentMountedRef.current = false;
    };
  }, [fetchBook, fetchMessages]);

  useEffect(() => {
    if (!user || !bookId) return;

    const timeoutId = setTimeout(() => {
      if (componentMountedRef.current) {
        setupWebSocket();
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, bookId, setupWebSocket]);

  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      stopPolling();
      cleanupChannel();
    };
  }, [stopPolling, cleanupChannel]);

  const handleSendMessage = async (message: string) => {
    if (!user || !message.trim() || !componentMountedRef.current) return;

    setSending(true);
    setWaitingForAI(true);
    
    try {
      console.log('🚀 Envoi message:', message);
      
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

      if (componentMountedRef.current) {
        const updated = [...messages, savedMessage];
        setMessages(updated);
        setStats(calculateStats(updated));
        setLastMessageCount(updated.length);
      }

      // **Appel webhook amélioré avec debug**
      try {
        console.log('🔗 Appel webhook n8n...');
        
        if (debugMode) {
          await addDebugMessage(
            `🚀 Envoi vers n8n:\nMessage: "${message.trim()}"\nBook ID: ${bookId}\nUser ID: ${user.id}`,
            'Webhook Request'
          );
        }
        
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
        console.log('📊 Réponse webhook complète:', result);

        if (debugMode) {
          await addDebugMessage(
            `📊 Réponse webhook:\n${JSON.stringify(result, null, 2)}`,
            'Webhook Response'
          );
        }

        if (!response.ok) {
          console.warn('⚠️ Webhook n8n a échoué:', result);
          setWaitingForAI(false);
          
          if (debugMode) {
            await addDebugMessage(
              `❌ Erreur webhook: ${result.error}\nStatut: ${response.status}`,
              'Webhook Error'
            );
          }
        } else {
          // Vérifier si une réponse IA a été sauvegardée
          if (result.success && result.aiResponseSaved && result.data?.savedAIResponse) {
            console.log('🤖 Réponse IA immédiate détectée et sauvegardée !');
            
            if (debugMode) {
              await addDebugMessage(
                `✅ Réponse IA immédiate:\nTaille: ${result.data.savedAIResponse.content.length} caractères\nID: ${result.data.savedAIResponse.id}`,
                'AI Response Immediate'
              );
            }
            
            const aiMessage: Message = {
              id: result.data.savedAIResponse.id,
              book_id: bookId,
              title: 'Réponse Assistant',
              content: result.data.savedAIResponse.content,
              created_at: result.data.savedAIResponse.timestamp
            };

            if (componentMountedRef.current) {
              const updatedWithAI = [...updated, aiMessage];
              setMessages(updatedWithAI);
              setStats(calculateStats(updatedWithAI));
              setLastMessageCount(updatedWithAI.length);
              setWaitingForAI(false);
            }
          } else if (result.success) {
            console.log('⏳ En attente de la réponse IA via realtime...');
            
            setTimeout(() => {
              if (waitingForAI && componentMountedRef.current) {
                console.warn('⏰ Timeout attente réponse IA');
                setWaitingForAI(false);
                
                if (debugMode) {
                  addDebugMessage(
                    `⏰ Timeout: Aucune réponse IA reçue après 60 secondes\nRequest ID: ${result.requestId}`,
                    'AI Response Timeout'
                  );
                }
              }
            }, 60000);
          }
        }

      } catch (webhookError: any) {
        console.error('💥 Erreur webhook n8n:', webhookError);
        setWaitingForAI(false);
        
        if (debugMode) {
          await addDebugMessage(
            `💥 Exception webhook:\n${webhookError.message}\n${webhookError.stack}`,
            'Webhook Exception'
          );
        }
      }

    } catch (error: any) {
      console.error('💥 Error sending message:', error);
      setWaitingForAI(false);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      if (componentMountedRef.current) {
        setSending(false);
      }
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
      {/* Header avec informations et debug */}
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
              
              <div className="flex items-center space-x-1">
                <span>{connectionStatus.icon}</span>
                <span className={`text-xs ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </span>
              </div>
              
              {waitingForAI && (
                <div className="flex items-center space-x-1">
                  <span className="animate-pulse">🤖</span>
                  <span className="text-xs text-blue-600">Assistant réfléchit...</span>
                </div>
              )}
              
              {/* **NOUVEAU: Indicateur debug mode** */}
              {debugMode && (
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">🔧</span>
                  <span className="text-xs text-red-600 font-mono">DEBUG</span>
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
            {/* **NOUVEAU: Panel debug** */}
            <Button
              variant={debugMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
            >
              🔧 Debug
            </Button>

            {debugMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testWebhook}
                >
                  🧪 Test
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportLogs('chat')}
                >
                  📋 Logs
                </Button>
              </>
            )}

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

        {/* **NOUVEAU: Panel debug étendu** */}
        {debugMode && (
          <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-yellow-400">🔧 DEBUG PANEL</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportLogs('json')}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  📥 Export JSON
                </button>
                <button
                  onClick={() => exportLogs('txt')}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  📄 Export TXT
                </button>
                <button
                  onClick={clearLogs}
                  className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-yellow-400">WebSocket</div>
                <div className="font-mono">{wsStatus}</div>
              </div>
              <div>
                <div className="text-yellow-400">Waiting AI</div>
                <div className="font-mono">{waitingForAI ? 'YES' : 'NO'}</div>
              </div>
              <div>
                <div className="text-yellow-400">Book ID</div>
                <div className="font-mono text-xs break-all">{bookId.substring(0, 8)}...</div>
              </div>
              <div>
                <div className="text-yellow-400">User ID</div>
                <div className="font-mono text-xs break-all">{user?.id?.substring(0, 8)}...</div>
              </div>
            </div>
          </div>
        )}

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