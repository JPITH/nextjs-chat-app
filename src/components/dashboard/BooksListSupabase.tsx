// src/components/dashboard/BooksListSupabase.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, truncateText } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface Book {
  id: string
  user_id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
  chapter_count: number
  message_count?: number
}

interface BookChat {
  id: string
  book_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export function BooksListSupabase() {
  // Suppression d'un livre avec confirmation
  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce livre ? Cette action est irréversible.')) return;
    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
      setBooks(books => books.filter(b => b.id !== bookId));
    } catch (error) {
      alert('Erreur lors de la suppression du livre.');
      // Optionnel: log
      console.error('Erreur suppression livre:', error);
    }
  }
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  // Vue : 'grid' ou 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('books_view_mode');
      if (saved === 'list' || saved === 'grid') return saved;
    }
    return 'grid';
  })
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  // Nouvelle version : récupère le count exact de messages pour chaque livre
  const fetchBooks = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      // Pour chaque livre, on va chercher le count book_chat
      const booksWithMsgCount = await Promise.all((data || []).map(async (b: any) => {
        const { count } = await supabase
          .from('book_chat')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', b.id)
        return { ...b, message_count: count ?? 0 }
      }))
      setBooks(booksWithMsgCount)
    } catch (error) {
      console.error('Erreur récupération livres:', error)
    } finally {
      setLoading(false)
    }
  }

  // Suppression de la fonction fetchBookChats et de l'état bookChats

  const createOrEditBook = async () => {
    if (!user || !title.trim()) return
    setCreating(true)
    try {
      if (editingBook) {
        // Edition
        const { data, error } = await supabase
          .from('books')
          .update({ title: title.trim(), description: description.trim() })
          .eq('id', editingBook.id)
          .select()
          .single()
        if (error) throw error
        setBooks(books => books.map(b => b.id === editingBook.id ? { ...b, ...data } : b))
      } else {
        // Création
        const newBook = {
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
        }
        const { data, error } = await supabase
          .from('books')
          .insert([newBook])
          .select()
          .single()
        if (error) throw error
        setBooks([data, ...books])
      }
      setShowForm(false)
      setTitle('')
      setDescription('')
      setEditingBook(null)
    } catch (error) {
      console.error('Erreur création/édition livre:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes livres</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('grid');
              if (typeof window !== 'undefined') window.localStorage.setItem('books_view_mode', 'grid');
            }}
          >
            🟦 Grille
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('list');
              if (typeof window !== 'undefined') window.localStorage.setItem('books_view_mode', 'list');
            }}
          >
            ☰ Liste
          </Button>
          <Button onClick={() => {
            setShowForm(true);
            setEditingBook(null);
            setTitle('');
            setDescription('');
          }}>
            Créer un nouveau livre
          </Button>
        </div>
      </div> 
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingBook(null); }} title={editingBook ? "Éditer le livre" : "Créer un nouveau livre"}>
        <div className="flex flex-col gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Titre du livre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={creating}
          />
          <textarea
            className="border rounded px-3 py-2"
            placeholder="Description du livre"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={creating}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingBook(null); }} disabled={creating}>
              Annuler
            </Button>
            <Button onClick={createOrEditBook} disabled={creating || !title.trim()}>
              {creating ? (editingBook ? 'Enregistrement...' : 'Création...') : (editingBook ? 'Enregistrer' : 'Créer')}
            </Button>
          </div>
        </div>
      </Modal>
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : books.length === 0 ? (
        <div className="text-gray-500">Aucun livre pour l’instant.</div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition">
                  <CardContent>
                    <h3 className="text-lg font-bold mb-2 pt-4">{truncateText(book.title, 40)}</h3>
                    <p className="text-gray-600 mb-2">{truncateText(book.description, 80)}</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                      <span>Créé le : {formatDate(book.created_at)}</span>
                      <span>Modifié le : {formatDate(book.updated_at)}</span>
                      {book.message_count ?? 0} messages
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.preventDefault();
                          setEditingBook(book);
                          setTitle(book.title || '');
                          setDescription(book.description || '');
                          setShowForm(true);
                        }}
                      >
                        Éditer
                      </Button>
                      <span className="flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" /></svg>
                        {book.message_count ?? 0} messages
                        <button onClick={e => {e.preventDefault(); handleDeleteBook(String(book.id));}} title="Supprimer le livre" className="ml-auto text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map(book => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition">
                  <CardContent className="flex flex-row items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 pt-4">{truncateText(book.title, 40)}</h3>
                      <p className="text-gray-600 mb-1">{truncateText(book.description, 80)}</p>
                      <span className="text-xs text-gray-400 block">Créé le : {formatDate(book.created_at)}</span>
                      <span className="text-xs text-gray-400 block">Modifié le : {formatDate(book.updated_at)}</span>
                      {book.message_count ?? 0} messages
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.preventDefault();
                          setEditingBook(book);
                          setTitle(book.title || '');
                          setDescription(book.description || '');
                          setShowForm(true);
                        }}
                      >
                        Éditer
                      </Button>
                      <span className="flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" /></svg>
                        {book.message_count ?? 0} messages
                        <button onClick={e => {e.preventDefault(); handleDeleteBook(String(book.id));}} title="Supprimer le livre" className="ml-auto text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
