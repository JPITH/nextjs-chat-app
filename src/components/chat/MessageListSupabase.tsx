// 2. Correction de src/components/chat/MessageListSupabase.tsx avec scroll fix
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // **NOUVEAU: Scroll automatique amélioré**
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && containerRef.current) {
        // Vérifier si on était déjà en bas avant le nouveau message
        const container = containerRef.current;
        const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        
        // Si on était en bas OU si c'est un nouveau message, scroller
        if (wasAtBottom || messages.length > lastMessageCountRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
        
        lastMessageCountRef.current = messages.length;
      }
    };

    // Délai court pour laisser le DOM se mettre à jour
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
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
           message.title?.toLowerCase().includes('user');
  };

  // **NOUVEAU: Détecter les messages de debug/logs**
  const isDebugMessage = (message: Message) => {
    return message.title?.toLowerCase().includes('debug') ||
           message.content.includes('🔧 **LOGS WEBHOOK N8N**');
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 max-w-md">
          <div className="text-4xl mb-4">✍️</div>
          <p className="text-lg mb-2">Commencez votre conversation</p>
          <p className="text-sm">Votre assistant d'écriture vous attend ! Posez votre première question ou demandez de l'aide pour démarrer votre livre.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{ 
        maxHeight: 'calc(100vh - 200px)', // Hauteur fixe pour permettre le scroll
        scrollBehavior: 'smooth'
      }}
    >
      {messages.map((message, index) => {
        const isUser = isUserMessage(message);
        const isDebug = isDebugMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${
              index === messages.length - 1 ? 'mb-4' : ''
            }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : isDebug
                  ? 'bg-gray-800 text-green-400 border border-gray-600 rounded-bl-sm font-mono text-xs'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
              }`}
            >
              {/* **NOUVEAU: Icône selon le type de message** */}
              <div className="flex items-start space-x-2">
                <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
                  {isUser ? (
                    <span className="text-blue-200">👤</span>
                  ) : isDebug ? (
                    <span className="text-green-400">🔧</span>
                  ) : (
                    <span className="text-blue-600">🤖</span>
                  )}
                </div>
                
                <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
                  {/* **NOUVEAU: Titre du message pour debug** */}
                  {isDebug && (
                    <div className="text-yellow-400 font-bold text-xs mb-2 uppercase">
                      {message.title}
                    </div>
                  )}
                  
                  {/* Contenu du message */}
                  <div className={`whitespace-pre-wrap break-words ${
                    isDebug ? 'font-mono text-xs leading-relaxed' : ''
                  }`}>
                    {message.content}
                  </div>
                  
                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-2 flex ${isUser ? 'justify-end' : 'justify-start'} ${
                      isUser 
                        ? 'text-blue-100' 
                        : isDebug
                        ? 'text-gray-500'
                        : 'text-gray-500'
                    }`}
                  >
                    <span>{formatDate(message.created_at)}</span>
                    {isDebug && (
                      <span className="ml-2 text-yellow-500">🔍 DEBUG</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* **ÉLÉMENT DE RÉFÉRENCE POUR LE SCROLL** */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}