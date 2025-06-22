// src/components/chat/MessageList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { formatDate } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] p-4 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div
              className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {formatDate(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}