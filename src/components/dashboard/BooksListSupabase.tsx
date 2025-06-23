// src/components/dashboard/BooksListSupabase.tsx - Version mise à jour
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, truncateText } from '@/lib/utils'
import { EnhancedBookCreation } from './EnhancedBookCreation'

interface Book {
  id: string
  user_id: string
  title: string
  description?: string
  genre?: string
  target_words?: number
  created_at: string
  updated_at: string
  message_count?: number
}

export function BooksListSupabase() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('books_view_mode');
      if (saved === 'list' || saved === 'grid') return saved;
    }
    return 'grid';
  })
  
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  const fetchBooks = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      // Pour chaque livre, récupérer le count des messages
      const booksWithMsgCount = await Promise.all((data || []).map(async (book: any) => {
        const { count } = await supabase
          .from('book_chat')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', book.id)
        return { ...book, message_count: count ?? 0 }
      }))
      
      setBooks(booksWithMsgCount)
    } catch (error) {
      console.error('Erreur récupération livres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${bookTitle}" ? Cette action est irréversible.`)) return
    
    try {
      // Supprimer d'abord tous les messages du livre
      const { error: chatError } = await supabase
        .from('book_chat')
        .delete()
        .eq('book_id', bookId)
      
      if (chatError) {
        console.error('Erreur suppression messages:', chatError)
      }
      
      // Puis supprimer le livre
      const { error: bookError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
      
      if (bookError) throw bookError
      
      setBooks(books => books.filter(b => b.id !== bookId))
    } catch (error) {
      console.error('Erreur suppression livre:', error)
      alert('Erreur lors de la suppression du livre.')
    }
  }

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
      'Autre': '📚'
    }
    return emojiMap[genre || 'Autre'] || '📚'
  }

  const getProgressPercentage = (book: Book) => {
    if (!book.target_words || !book.message_count) return 0
    // Estimation basique : ~50 mots par message utilisateur en moyenne
    const estimatedWords = (book.message_count / 2) * 50
    return Math.min(Math.round((estimatedWords / book.target_words) * 100), 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Mes livres</h2>
          <div className="flex gap-2">
            <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
          </div>
        </div>
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Mes livres</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('grid');
              if (typeof window !== 'undefined') window.localStorage.setItem('books_view_mode', 'grid');
            }}
            size="sm"
          >
            🟦 Grille
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('list');
              if (typeof window !== 'undefined') window.localStorage.setItem('books_view_mode', 'list');
            }}
            size="sm"
          >
            ☰ Liste
          </Button>
          <EnhancedBookCreation onBookCreated={fetchBooks} />
        </div>
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
        <div className={viewMode === 'grid' ? 
          "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-4"
        }>
          {books.map(book => {
            const progress = getProgressPercentage(book)
            
            return (
              <Card 
                key={book.id} 
                className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
              >
                <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-4'}>
                  <div className={viewMode === 'grid' ? 'space-y-4' : 'flex items-center space-x-4'}>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getGenreEmoji(book.genre)}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {truncateText(book.title, viewMode === 'grid' ? 40 : 60)}
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
                          {truncateText(book.description, viewMode === 'grid' ? 80 : 120)}
                        </p>
                      )}

                      {/* Barre de progression */}
                      {book.target_words && progress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Statistiques */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{book.message_count || 0} échanges</span>
                          </span>
                          {book.target_words && (
                            <span className="flex items-center space-x-1">
                              <span>🎯</span>
                              <span>{(book.target_words / 1000).toFixed(0)}k mots</span>
                            </span>
                          )}
                        </div>
                        <span>{formatDate(book.updated_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={viewMode === 'grid' ? 'flex justify-between items-center pt-2' : 'flex items-center space-x-2'}>
                      <Link href={`/books/${book.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          {book.message_count === 0 ? '🚀 Commencer' : '✏️ Continuer'}
                        </Button>
                      </Link>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDeleteBook(book.id, book.title)
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            )
          })}
        </div>
      )}
    </div>
  )
}