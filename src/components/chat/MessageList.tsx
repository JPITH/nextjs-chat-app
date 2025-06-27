// src/components/chat/MessageList.tsx - Version améliorée
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500 max-w-md">
          <div className="text-6xl mb-6">✍️</div>
          <h3 className="text-xl font-medium text-gray-700 mb-3">
            Commencez votre conversation
          </h3>
          <p className="text-gray-500 leading-relaxed">
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
      className="flex-1 overflow-y-auto p-4 space-y-6 pb-8"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#CBD5E0 transparent'
      }}
    >
      {messages.map((message, index) => {
        const isUser = isUserMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                isUser
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
                  {isUser ? (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      👤
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">
                      🤖
                    </div>
                  )}
                </div>
                
                <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </div>
                  
                  <div
                    className={`text-xs mt-3 flex ${isUser ? 'justify-end' : 'justify-start'} ${
                      isUser ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    <span className="bg-black bg-opacity-10 px-2 py-1 rounded-full">
                      {formatDate(message.created_at)}
                    </span>
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