// src/app/debug/page.tsx - Page de debug pour tester les webhooks
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DebugPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [testMessage, setTestMessage] = useState('Ceci est un message de test de l\'assistant IA.');
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      if (response.ok) {
        setBooks(data.books || []);
        if (data.books?.length > 0) {
          setSelectedBookId(data.books[0].id);
        }
        addLog(`📚 ${data.books?.length || 0} livres récupérés`);
      }
    } catch (error) {
      addLog(`❌ Erreur récupération livres: ${error}`);
    }
  };

  const testWebhookGet = async () => {
    try {
      addLog('🧪 Test GET /api/webhook/n8n...');
      const response = await fetch('/api/webhook/n8n');
      const data = await response.json();
      addLog(`✅ GET webhook: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`❌ Erreur GET webhook: ${error}`);
    }
  };

  const testWebhookPost = async () => {
    if (!selectedBookId) {
      addLog('❌ Sélectionnez un livre d\'abord');
      return;
    }

    setTesting(true);
    try {
      addLog('🧪 Test POST /api/webhook/n8n...');
      
      const payload = {
        bookId: selectedBookId,
        response: testMessage,
        timestamp: new Date().toISOString()
      };

      addLog(`📤 Payload envoyé: ${JSON.stringify(payload, null, 2)}`);

      const response = await fetch('/api/webhook/n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ POST webhook réussi: ${JSON.stringify(data, null, 2)}`);
        addLog('🎉 Vérifiez l\'interface de chat, le message devrait apparaître !');
      } else {
        addLog(`❌ POST webhook échoué: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addLog(`❌ Erreur POST webhook: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const testMessageSend = async () => {
    if (!selectedBookId) {
      addLog('❌ Sélectionnez un livre d\'abord');
      return;
    }

    setTesting(true);
    try {
      addLog('📤 Test envoi message utilisateur...');
      
      const response = await fetch(`/api/books/${selectedBookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Message de test depuis la page debug'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ Message envoyé: ${JSON.stringify(data, null, 2)}`);
      } else {
        addLog(`❌ Erreur envoi message: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addLog(`❌ Erreur envoi message: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const checkEnvironment = () => {
    addLog('🔍 VÉRIFICATION ENVIRONNEMENT:');
    addLog(`- URL App: ${window.location.origin}`);
    addLog(`- Webhook endpoint: ${window.location.origin}/api/webhook/n8n`);
    addLog(`- User connecté: ${user ? '✅' : '❌'}`);
    addLog(`- Livres disponibles: ${books.length}`);
    
    // Vérifier les variables d'environnement (côté client)
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    addLog(`- N8N Webhook URL: ${webhookUrl ? '✅ Configurée' : '❌ Manquante'}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Accès restreint</h2>
            <p className="text-gray-600">Connectez-vous pour accéder à la page de debug.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de contrôle */}
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Debug Webhooks & Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Livre de test:</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionnez un livre</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message de test IA:</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg h-20 resize-none"
                  placeholder="Message qui sera envoyé comme réponse IA..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={checkEnvironment} variant="outline">
                  🔍 Vérifier Config
                </Button>
                <Button onClick={testWebhookGet} variant="outline">
                  🧪 Test GET Webhook
                </Button>
                <Button 
                  onClick={testWebhookPost} 
                  disabled={testing || !selectedBookId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {testing ? 'Test...' : '🚀 Test POST Webhook'}
                </Button>
                <Button 
                  onClick={testMessageSend} 
                  disabled={testing || !selectedBookId}
                  variant="outline"
                >
                  📤 Test Message User
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Configuration n8n:</h3>
                <div className="bg-gray-100 p-3 rounded-lg text-xs">
                  <p><strong>URL:</strong> {window.location.origin}/api/webhook/n8n</p>
                  <p><strong>Method:</strong> POST</p>
                  <p><strong>Payload:</strong> {`{ "bookId": "...", "response": "..." }`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs en temps réel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>📋 Logs de Debug</CardTitle>
              <Button onClick={clearLogs} variant="outline" size="sm">
                🗑️ Effacer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Aucun log pour le moment...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1 whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📖 Instructions de debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-green-600 mb-2">✅ Si tout fonctionne:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Les messages utilisateur s'affichent immédiatement</li>
                  <li>• Le webhook POST retourne success: true</li>
                  <li>• Les réponses IA apparaissent dans le chat</li>
                  <li>• WebSocket connecté dans les logs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-600 mb-2">❌ Problèmes courants:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Messages n'apparaissent pas:</strong> Vérifier WebSocket</li>
                  <li>• <strong>Webhook échoue:</strong> Vérifier bookId et payload</li>
                  <li>• <strong>n8n ne répond pas:</strong> Vérifier URL webhook</li>
                  <li>• <strong>Pas de temps réel:</strong> Recharger la page chat</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}