// src/components/chat/ChatInterface.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/Button';
import { Message, ChatSession } from '@/types/chat';

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/chat/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setSession(data.session);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Setup Server-Sent Events for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    const eventSource = new EventSource(`/api/sse/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          const newMessage: Message = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          };
          
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const handleSendMessage = async (message: string) => {
    setSending(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/chat/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        // Message will be added via SSE, but add immediately for better UX
        setMessages(prev => [...prev, data.message]);
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
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {session?.title || 'Conversation'}
            </h1>
            <p className="text-sm text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
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
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
      />
    </div>
  );
}