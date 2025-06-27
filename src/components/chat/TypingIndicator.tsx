// src/components/chat/TypingIndicator.tsx - Composant d'animation de typing avancé
'use client';

import React, { useState, useEffect } from 'react';

interface TypingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dots' | 'bars' | 'wave';
  message?: string;
  showAvatar?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  size = 'md',
  variant = 'dots',
  message = "L'assistant écrit",
  showAvatar = true
}) => {
  const [typingMessage, setTypingMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation de texte qui s'écrit progressivement
  useEffect(() => {
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setTypingMessage(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, message]);

  // Reset animation quand le message change
  useEffect(() => {
    setTypingMessage('');
    setCurrentIndex(0);
  }, [message]);

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  const renderTypingAnimation = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1 items-center">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${dotSizes[size]} bg-blue-500 rounded-full animate-bounce`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-0.5 items-end">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  height: `${8 + (index % 2) * 4}px`,
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex space-x-0.5 items-center">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`${dotSizes[size]} bg-blue-500 rounded-full`}
                style={{
                  animation: `typing-dots 1.4s infinite ease-in-out`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex justify-start animate-fade-in ${className}`}>
      <div className={`max-w-[85%] rounded-2xl bg-white border border-gray-100 rounded-bl-md shadow-sm hover:shadow-md transition-all duration-300 ${sizeClasses[size]}`}>
        <div className="flex items-center space-x-3">
          {showAvatar && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">
              🤖
            </div>
          )}
          
          <div className="flex items-center space-x-2 min-w-0">
            <div className="text-gray-600 font-medium">
              {typingMessage}
              <span className="animate-pulse">|</span>
            </div>
            {renderTypingAnimation()}
          </div>
        </div>
        
        {/* Barre de progression subtile */}
        <div className="mt-2 w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-loading-bar"
            style={{ 
              animation: 'loading-bar 2s ease-in-out infinite',
              transformOrigin: 'left'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Composant pour les effets de particules (optionnel)
export const TypingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
          style={{
            left: `${20 + i * 10}%`,
            top: '50%',
            animation: `float 2s infinite ease-in-out`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </div>
  );
};

// Hook personnalisé pour gérer l'état de typing
export const useTypingIndicator = (delay: number = 1000) => {
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTyping = () => {
    setIsTyping(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const hideTyping = (withDelay: boolean = true) => {
    if (withDelay) {
      const id = setTimeout(() => {
        setIsTyping(false);
      }, delay);
      setTimeoutId(id);
    } else {
      setIsTyping(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isTyping, showTyping, hideTyping };
};

export default TypingIndicator;