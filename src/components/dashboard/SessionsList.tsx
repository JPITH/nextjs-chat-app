// src/components/dashboard/SessionsList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChatSession } from '@/types/chat';
import { formatDate, truncateText } from '@/lib/utils';

export function SessionsList() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Nouvelle conversation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.session.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
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
                        <span>{session.messageCount} messages</span>
                        <span>•</span>
                        <span>Mis à jour {formatDate(session.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}