// src/components/chat/MessageList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import type { BookMessage } from '@/types/database';

interface MessageListProps {
  messages: BookMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  const isUserMessage = (message: BookMessage) => {
    return message.title?.toLowerCase().includes('utilisateur');
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 max-w-md">
          <div className="text-4xl mb-4">✍️</div>
          <p className="text-lg mb-2">Commencez votre conversation</p>
          <p className="text-sm">
            Votre assistant d'écriture vous attend ! Posez votre première question 
            ou demandez de l'aide pour démarrer votre livre.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message, index) => {
        const isUser = isUserMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
                  {isUser ? (
                    <span className="text-blue-200">👤</span>
                  ) : (
                    <span className="text-blue-600">🤖</span>
                  )}
                </div>
                
                <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  
                  <div
                    className={`text-xs mt-2 flex ${isUser ? 'justify-end' : 'justify-start'} ${
                      isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    <span>{formatDate(message.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}