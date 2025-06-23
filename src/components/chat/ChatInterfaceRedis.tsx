// src/components/chat/ChatInterfaceRedis.tsx - Version avec Redis
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import { redisManager, handleWebhookWithRedis } from '@/lib/redis-manager';
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

interface ChatInterfaceRedisProps {
  sessionId: string;
}

export function ChatInterfaceRedis({ sessionId }: ChatInterfaceRedisProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [redisStatus, setRedisStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  // Vérifier le statut Redis au démarrage
  useEffect(() => {
    const checkRedisStatus = async () => {
      try {
        const stats = await redisManager.getRedisStats();
        setRedisStatus(stats.isConnected ? 'connected' : 'error');
        console.log('Statut Redis:', stats);
      } catch (error) {
        console.error('Erreur vérification Redis:', error);
        setRedisStatus('error');
      }
    };

    checkRedisStatus();
  }, []);

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
      // Essayer Redis d'abord, puis fallback sur Supabase
      let messagesData: Message[] = [];

      if (redisStatus === 'connected') {
        try {
          const redisMessages = await redisManager.getMessagesForAI(sessionId, 100);
          messagesData = redisMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            session_id: msg.session_id
          }));
          console.log(`${messagesData.length} messages chargés depuis Redis`);
        } catch (redisError) {
          console.warn('Erreur Redis, fallback Supabase:', redisError);
        }
      }

      // Fallback sur Supabase si Redis échoue ou pas de messages
      if (messagesData.length === 0) {
        const { data: supabaseMessages, error: supabaseError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true });

        if (supabaseError) {
          console.error('Erreur récupération messages:', supabaseError);
          return;
        }

        messagesData = supabaseMessages || [];
        console.log(`${messagesData.length} messages chargés depuis Supabase`);
      }

      setMessages(messagesData);
    } catch (error) {
      console.error('Erreur fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, supabase, redisStatus]);

  useEffect(() => {
    fetchSession();
    fetchMessages();
  }, [fetchSession, fetchMessages]);

  // Configuration WebSocket temps réel
  useEffect(() => {
    if (!user || !sessionId) return;

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
              console.log('Nouveau message reçu via WebSocket:', payload);
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
          console.error('Erreur fermeture WebSocket:', error);
        }
        channelRef.current = null;
      }
    };
  }, [sessionId, user, supabase]);

  const handleSendMessage = async (message: string) => {
    if (!user || !session) return;

    setSending(true);
    try {
      // 1. Créer le message utilisateur
      const userMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        content: message,
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
      };

      // 2. Sauvegarder via Redis Manager (qui sauvegarde en Supabase ET Redis)
      await redisManager.saveMessage(userMessage);

      // 3. Ajouter à l'état local si WebSocket ne fonctionne pas
      if (wsStatus !== 'connected') {
        setMessages(prev => [...prev, userMessage]);
      }

      // 4. Mettre à jour la session
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

      // 5. Envoyer à n8n avec contexte Redis
      try {
        console.log('Envoi webhook n8n avec contexte Redis...');
        
        const webhookResult = await handleWebhookWithRedis(sessionId, user.id, message);
        
        if (!webhookResult.success) {
          console.error('Erreur webhook:', webhookResult.error);
          return;
        }

        console.log('Webhook n8n envoyé avec succès');

        // 6. Traiter la réponse n8n si elle existe
        if (webhookResult.data?.response) {
          const assistantMessage = {
            id: crypto.randomUUID(),
            session_id: sessionId,
            content: webhookResult.data.response,
            sender: 'assistant' as const,
            timestamp: new Date().toISOString(),
          };

          // Sauvegarder la réponse via Redis Manager
          await redisManager.saveMessage(assistantMessage);

          // Sauvegarder le contexte IA mis à jour si fourni
          if (webhookResult.data.ai_context_update) {
            await redisManager.saveAIContext(sessionId, webhookResult.data.ai_context_update);
            console.log('Contexte IA mis à jour via Redis');
          }

          // Ajouter à l'état local si WebSocket ne fonctionne pas
          if (wsStatus !== 'connected') {
            setMessages(prev => [...prev, assistantMessage]);
          }

          // Mettre à jour le compteur de session
          const { error: updateCountError } = await supabase
            .from('chat_sessions')
            .update({
              message_count: session.message_count + 2,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

          if (!updateCountError) {
            setSession(prev => prev ? {
              ...prev,
              message_count: prev.message_count + 2,
              updated_at: new Date().toISOString()
            } : null);
          }
        }

      } catch (webhookError) {
        console.error('Erreur webhook n8n:', webhookError);
      }

    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  // Fonction pour synchroniser Redis
  const handleSyncRedis = async () => {
    try {
      console.log('Synchronisation Redis en cours...');
      await redisManager.syncSessionWithSupabase(sessionId);
      await fetchMessages(); // Recharger les messages
      console.log('Synchronisation Redis terminée');
    } catch (error) {
      console.error('Erreur synchronisation Redis:', error);
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
      {/* Header avec statuts */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {session?.title || 'Conversation'}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              
              {/* Statut WebSocket */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  wsStatus === 'connected' ? 'bg-green-500' : 
                  wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div