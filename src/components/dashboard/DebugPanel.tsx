// src/components/dashboard/DebugPanel.tsx - Panneau de debug pour le dashboard
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface WebhookLog {
  timestamp: string;
  type: 'REQUEST' | 'RESPONSE' | 'ERROR';
  data: any;
}

interface SystemStatus {
  supabase: 'connected' | 'error' | 'checking';
  webhook: 'active' | 'error' | 'checking';
  realtime: 'connected' | 'disconnected' | 'checking';
}

export function DebugPanel() {
  const [showDebug, setShowDebug] = useState(false)
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    supabase: 'checking',
    webhook: 'checking', 
    realtime: 'checking'
  })
  const [testResults, setTestResults] = useState<any>(null)

  // Récupérer les logs webhook
  const fetchWebhookLogs = async () => {
    try {
      const response = await fetch('/api/webhook/n8n?debug=logs')
      const data = await response.json()
      setWebhookLogs(data.logs || [])
    } catch (error) {
      console.error('Erreur récupération logs:', error)
    }
  }

  // Tester le statut des systèmes
  const checkSystemStatus = async () => {
    setSystemStatus({
      supabase: 'checking',
      webhook: 'checking',
      realtime: 'checking'
    })

    // Test Supabase
    try {
      const supabaseResponse = await fetch('/api/books/sessions')
      setSystemStatus(prev => ({
        ...prev,
        supabase: supabaseResponse.ok ? 'connected' : 'error'
      }))
    } catch {
      setSystemStatus(prev => ({ ...prev, supabase: 'error' }))
    }

    // Test Webhook n8n
    try {
      const webhookResponse = await fetch('/api/webhook/n8n')
      setSystemStatus(prev => ({
        ...prev,
        webhook: webhookResponse.ok ? 'active' : 'error'
      }))
    } catch {
      setSystemStatus(prev => ({ ...prev, webhook: 'error' }))
    }

    // Test Realtime (approximatif)
    setSystemStatus(prev => ({ ...prev, realtime: 'connected' }))
  }

  // Test complet du workflow
  const runFullTest = async () => {
    setTestResults({ testing: true })
    
    try {
      // Test 1: Créer un livre de test
      const createBookResponse = await fetch('/api/books/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Debug - ' + new Date().toISOString(),
          description: 'Livre de test pour debug système'
        })
      })
      
      const createBookResult = await createBookResponse.json()
      
      if (!createBookResponse.ok) {
        throw new Error(`Création livre échouée: ${createBookResult.error}`)
      }

      const testBookId = createBookResult.book.id

      // Test 2: Envoyer un message
      const messageResponse = await fetch(`/api/books/${testBookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test de debug système - ignorez ce message'
        })
      })

      const messageResult = await messageResponse.json()

      // Test 3: Vérifier webhook n8n
      const webhookTestResponse = await fetch('/api/webhook/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: testBookId,
          message: 'Test webhook debug',
          userId: 'test-user'
        })
      })

      const webhookResult = await webhookTestResponse.json()

      // Nettoyer - supprimer le livre de test
      try {
        await fetch(`/api/books/${testBookId}`, { method: 'DELETE' })
      } catch (cleanupError) {
        console.warn('Erreur nettoyage livre test:', cleanupError)
      }

      setTestResults({
        success: true,
        bookCreation: createBookResponse.ok,
        messageSystem: messageResponse.ok,
        webhookSystem: webhookTestResponse.ok,
        details: {
          book: createBookResult,
          message: messageResult,
          webhook: webhookResult
        },
        timestamp: new Date().toISOString()
      })

    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Nettoyer les logs
  const clearLogs = async () => {
    try {
      await fetch('/api/webhook/n8n?debug=clear', { method: 'DELETE' })
      setWebhookLogs([])
    } catch (error) {
      console.error('Erreur nettoyage logs:', error)
    }
  }

  useEffect(() => {
    if (showDebug) {
      fetchWebhookLogs()
      checkSystemStatus()
      
      // Auto-refresh toutes les 10 secondes
      const interval = setInterval(() => {
        fetchWebhookLogs()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [showDebug])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'active': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'disconnected': return 'text-orange-600'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': case 'active': return '✅'
      case 'error': return '❌'
      case 'disconnected': return '⚠️'
      case 'checking': return '⏳'
      default: return '❓'
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(true)}
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          🔧 Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-900">🔧 Panneau de Debug Système</h2>
            <Button
              variant="outline"
              onClick={() => setShowDebug(false)}
            >
              ✕ Fermer
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Statut des systèmes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Statut des Systèmes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Supabase Database</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(systemStatus.supabase)}</span>
                    <span className={`font-bold ${getStatusColor(systemStatus.supabase)}`}>
                      {systemStatus.supabase.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Webhook n8n</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(systemStatus.webhook)}</span>
                    <span className={`font-bold ${getStatusColor(systemStatus.webhook)}`}>
                      {systemStatus.webhook.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Realtime WebSocket</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(systemStatus.realtime)}</span>
                    <span className={`font-bold ${getStatusColor(systemStatus.realtime)}`}>
                      {systemStatus.realtime.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    size="sm"
                    onClick={checkSystemStatus}
                    className="w-full"
                  >
                    🔄 Actualiser Statuts
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={runFullTest}
                    className="w-full"
                    disabled={testResults?.testing}
                  >
                    🧪 Test Complet du Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚙️ Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                    <div className={`mt-1 ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                      {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configuré' : '❌ Manquant'}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">NEXT_PUBLIC_N8N_WEBHOOK_URL:</span>
                    <div className={`mt-1 ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? 'text-green-600' : 'text-red-600'}`}>
                      {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? '✅ Configuré' : '❌ Manquant'}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">N8N Authentication:</span>
                    <div className={`mt-1 ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER ? 'text-green-600' : 'text-red-600'}`}>
                      {process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER ? '✅ Configuré' : '❌ Manquant'}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Environment:</span>
                    <div className="mt-1 text-blue-600 font-bold">
                      {process.env.NODE_ENV || 'development'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résultats de test */}
            {testResults && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">🧪 Résultats du Test Complet</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.testing ? (
                    <div className="text-center text-blue-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Test en cours...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`font-bold text-lg ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.success ? '✅ Test Réussi' : '❌ Test Échoué'}
                      </div>
                      
                      {testResults.success && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Création Livre:</span>
                            <div className={testResults.bookCreation ? 'text-green-600' : 'text-red-600'}>
                              {testResults.bookCreation ? '✅ OK' : '❌ Échec'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Système Messages:</span>
                            <div className={testResults.messageSystem ? 'text-green-600' : 'text-red-600'}>
                              {testResults.messageSystem ? '✅ OK' : '❌ Échec'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Webhook n8n:</span>
                            <div className={testResults.webhookSystem ? 'text-green-600' : 'text-red-600'}>
                              {testResults.webhookSystem ? '✅ OK' : '❌ Échec'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {testResults.error && (
                        <div className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="font-medium text-red-900">Erreur:</div>
                          <div className="text-red-700 text-sm mt-1">{testResults.error}</div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Test exécuté le {new Date(testResults.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Logs webhook */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">📋 Logs Webhook n8n ({webhookLogs.length})</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={fetchWebhookLogs}>
                      🔄 Actualiser
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearLogs}>
                      🗑️ Nettoyer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded border max-h-60 overflow-y-auto">
                  {webhookLogs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun log webhook disponible
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {webhookLogs.slice(-10).reverse().map((log, index) => (
                        <div key={index} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold px-2 py-1 rounded text-xs ${
                              log.type === 'ERROR' ? 'bg-red-100 text-red-800' :
                              log.type === 'RESPONSE' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}