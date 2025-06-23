// 6. Corriger src/components/chat/MessageListSupabase.tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  title: string;
  created_at: string;
  book_id: string;
}

interface MessageListSupabaseProps {
  messages: Message[];
}

export default function MessageListSupabase({ messages }: MessageListSupabaseProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  // Détecter si le message est de l'utilisateur ou de l'assistant
  const isUserMessage = (message: Message) => {
    return message.title?.toLowerCase().includes('utilisateur') || 
           message.title?.toLowerCase().includes('user') ||
           !message.title?.toLowerCase().includes('assistant');
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Commencez votre conversation</p>
          <p className="text-sm">Tapez votre message ci-dessous pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isUser = isUserMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-lg ${
                isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  isUser ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatDate(message.created_at)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
