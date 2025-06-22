// src/components/chat/ChatInterfaceSupabase.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import MessageListSupabase from './MessageListSupabase';
import MessageInputSupabase from './MessageInputSupabase';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  session_id: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatInterfaceSupabaseProps {
  sessionId: string;
}

export function ChatInterfaceSupabase({ sessionId }: ChatInterfaceSupabaseProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  const fetchSession = useCallback(async () => {
    if (!user) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError) {
        console.error('Erreur récupération session:', sessionError);
        router.push('/dashboard');
        return;
      }

      setSession(sessionData);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  }, [sessionId, user, router, supabase]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (messagesError) {
        console.error('Erreur récupération messages:', messagesError);
        return;
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, supabase]);

  useEffect(() => {
    fetchSession();
    fetchMessages();
  }, [fetchSession, fetchMessages]);

  // Configuration du temps réel avec gestion d'erreur améliorée
  useEffect(() => {
    if (!user || !sessionId) return;

    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtimeSubscription = () => {
      try {
        setWsStatus('connecting');
        
        // Nettoyer l'ancien channel s'il existe
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        const channel = supabase
          .channel(`messages_${sessionId}`, {
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
              table: 'chat_messages',
              filter: `session_id=eq.${sessionId}`,
            },
            (payload) => {
              console.log('Nouveau message reçu:', payload);
              const newMessage = payload.new as Message;
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
            console.log('Statut WebSocket:', status);
            
            if (status === 'SUBSCRIBED') {
              setWsStatus('connected');
              retryCount = 0; // Reset retry count on successful connection
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setWsStatus('disconnected');
              
              // Retry logic
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Tentative de reconnexion ${retryCount}/${maxRetries}...`);
                timeoutId = setTimeout(() => {
                  setupRealtimeSubscription();
                }, 2000 * retryCount); // Exponential backoff
              } else {
                console.log('Abandon de la reconnexion WebSocket, polling de secours activé');
                // Fallback to polling
                startPolling();
              }
            } else if (status === 'CLOSED') {
              setWsStatus('disconnected');
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Erreur configuration WebSocket:', error);
        setWsStatus('disconnected');
        
        // Fallback to polling
        if (retryCount < maxRetries) {
          retryCount++;
          timeoutId = setTimeout(() => {
            setupRealtimeSubscription();
          }, 2000 * retryCount);
        } else {
          startPolling();
        }
      }
    };

    // Polling de secours si WebSocket échoue
    let pollingInterval: NodeJS.Timeout;
    
    const startPolling = () => {
      console.log('Démarrage du polling de secours...');
      pollingInterval = setInterval(() => {
        fetchMessages();
      }, 3000); // Vérifier les nouveaux messages toutes les 3 secondes
    };

    // Démarrer la subscription WebSocket
    setupRealtimeSubscription();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (pollingInterval) clearInterval(pollingInterval);
      
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Erreur lors de la fermeture du channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [sessionId, user, supabase, fetchMessages]);

  // src/components/chat/ChatInterfaceSupabase.tsx - Gestion des réponses n8n

const handleSendMessage = async (message: string) => {
  if (!user || !session) return;

  setSending(true);
  try {
    // Créer le message utilisateur
    const userMessage: Omit<Message, 'id'> = {
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    // Sauvegarder le message en base
    const { data: savedMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert(userMessage)
      .select()
      .single();

    if (messageError) {
      console.error('Erreur sauvegarde message:', messageError);
      return;
    }

    // Si WebSocket ne fonctionne pas, ajouter le message manuellement
    if (wsStatus !== 'connected') {
      setMessages(prev => [...prev, savedMessage]);
    }

    // Mettre à jour le compteur de messages de la session
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        message_count: session.message_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Erreur mise à jour session:', updateError);
    } else {
      setSession(prev => prev ? {
        ...prev,
        message_count: prev.message_count + 1,
        updated_at: new Date().toISOString()
      } : null);
    }

    // ============ WEBHOOK N8N AVEC TRAITEMENT DE LA RÉPONSE ============
    try {
      console.log('Envoi webhook n8n...');
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER || 'admin';
      const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || 'v7Efb2!h@A6RxP';

      if (!webhookUrl) {
        console.warn('URL webhook n8n non configurée');
        return;
      }

      const basicAuth = 'Basic ' + btoa(`${username}:${password}`);

      const webhookPayload = {
        sessionId,
        userId: user.id,
        message,
        timestamp: new Date().toISOString(),
      };

      console.log('Payload webhook:', webhookPayload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
          'Origin': window.location.origin,
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur webhook n8n:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return;
      }

      const result = await response.json();
      console.log('Réponse webhook n8n:', result);

      // ========== TRAITEMENT DE LA RÉPONSE N8N ==========
      if (result.response) {
        // Créer le message de l'assistant
        const assistantMessage: Omit<Message, 'id'> = {
          content: result.response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: sessionId,
        };

        // Sauvegarder la réponse en base
        const { data: savedAssistantMessage, error: assistantError } = await supabase
          .from('chat_messages')
          .insert(assistantMessage)
          .select()
          .single();

        if (assistantError) {
          console.error('Erreur sauvegarde réponse assistant:', assistantError);
        } else {
          console.log('Réponse assistant sauvegardée:', savedAssistantMessage);
          
          // Si WebSocket ne fonctionne pas, ajouter le message manuellement
          if (wsStatus !== 'connected') {
            setMessages(prev => [...prev, savedAssistantMessage]);
          }

          // Mettre à jour le compteur de messages
          const { error: updateCountError } = await supabase
            .from('chat_sessions')
            .update({
              message_count: session.message_count + 2, // +1 user + 1 assistant
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

          if (updateCountError) {
            console.error('Erreur mise à jour compteur:', updateCountError);
          } else {
            setSession(prev => prev ? {
              ...prev,
              message_count: prev.message_count + 2,
              updated_at: new Date().toISOString()
            } : null);
          }
        }
      }

    } catch (webhookError) {
      console.error('Erreur webhook n8n:', webhookError);
    }

  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setSending(false);
  }
};
  // Ajoutez ceci temporairement dans ChatInterfaceSupabase.tsx après le handleSendMessage

  // Debug : vérifier les variables d'environnement
  useEffect(() => {
    console.log('Variables environnement côté client:');
    console.log('NEXT_PUBLIC_N8N_WEBHOOK_URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
    console.log('User ID:', user?.id);
    console.log('Session ID:', sessionId);
  }, [user, sessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Chargement de la conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {session?.title || 'Conversation'}
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
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Retour au dashboard
          </Button>
        </div>
      </div>

      {/* Messages */}
      <MessageListSupabase messages={messages} />

      {/* Input */}
      <MessageInputSupabase
        onSendMessage={handleSendMessage}
        disabled={sending}
      />
    </div>
  );
}