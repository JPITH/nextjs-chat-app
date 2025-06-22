// src/components/dashboard/SessionsListSupabase.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, truncateText } from '@/lib/utils'

interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export function SessionsListSupabase() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Erreur récupération sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    if (!user) return
    
    setCreating(true)
    try {
      const newSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title: 'Nouvelle conversation',
        message_count: 0,
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(newSession)
        .select()
        .single()

      if (error) throw error
      
      router.push(`/chat/${data.id}`)
    } catch (error) {
      console.error('Erreur création session:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mes conversations</h1>
        <Button onClick={createNewSession} disabled={creating}>
          {creating ? 'Création...' : 'Nouvelle conversation'}
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Vous n'avez pas encore de conversations.
            </p>
            <Button onClick={createNewSession} disabled={creating}>
              {creating ? 'Création...' : 'Commencer une conversation'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {truncateText(session.title, 60)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{session.message_count} messages</span>
                        <span>•</span>
                        <span>Mis à jour {formatDate(new Date(session.updated_at))}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(new Date(session.created_at))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}