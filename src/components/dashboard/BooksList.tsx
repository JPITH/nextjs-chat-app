// src/components/dashboard/BooksList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, truncateText } from '@/lib/utils';
import { EnhancedBookCreation } from './EnhancedBookCreation';
import type { Book } from '@/types/database';

export function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      
      if (response.ok) {
        setBooks(data.books || []);
      } else {
        console.error('Erreur récupération livres:', data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`Supprimer "${bookTitle}" ? Cette action est irréversible.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBooks(books => books.filter(b => b.id !== bookId));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getGenreEmoji = (genre?: string) => {
    const emojiMap: Record<string, string> = {
      'Fiction': '📖',
      'Fiction courte': '📝',
      'Non-fiction': '👤',
      'Essai': '🤔',
      'Développement personnel': '🌱',
      'Business': '💼',
      'Poésie': '🎭',
      'Jeunesse': '🧸',
      'Récit de voyage': '🗺️',
      'Gastronomie': '👨‍🍳',
      'Thriller': '🔍',
      'Fantasy': '🏰',
    };
    return emojiMap[genre || 'Autre'] || '📚';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Mes livres</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Mes livres</h2>
        <EnhancedBookCreation onBookCreated={fetchBooks} />
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun livre pour l'instant
            </h3>
            <p className="text-gray-500 mb-6">
              Créez votre premier livre avec l'aide d'un assistant spécialisé
            </p>
            <EnhancedBookCreation onBookCreated={fetchBooks} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <Card 
              key={book.id} 
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getGenreEmoji(book.genre)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {truncateText(book.title, 40)}
                        </h3>
                        {book.genre && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {book.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {book.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {truncateText(book.description, 80)}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {book.target_words && (
                        <span className="flex items-center space-x-1">
                          <span>🎯</span>
                          <span>{(book.target_words / 1000).toFixed(0)}k mots</span>
                        </span>
                      )}
                    </div>
                    <span>{formatDate(book.updated_at)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Link href={`/books/${book.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        ✏️ Écrire
                      </Button>
                    </Link>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteBook(book.id, book.title);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2"
                      title="Supprimer le livre"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}