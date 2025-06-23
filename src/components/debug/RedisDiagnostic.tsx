// src/components/debug/RedisDiagnostic.tsx
// Composant supprimé : Redis non utilisé

// Fichier supprimé : RedisDiagnostic n'est plus utilisé { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export function RedisDiagnostic() {
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('Non testé')
  const [stats, setStats] = useState<any>(null)
  const [tablesTest, setTablesTest] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])

  // Test de connexion de base
  const testConnection = async () => {
    setLoading(true)
    try {
      const isConnected = await supabaseRedisManager.testRedisConnection()
      setConnectionStatus(isConnected ? '✅ Connecté' : '❌ Déconnecté')
    } catch (error) {
      setConnectionStatus(`❌ Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Test des statistiques
  const testStats = async () => {
    setLoading(true)
    try {
      const statsData = await supabaseRedisManager.getRedisStats()
      setStats(statsData)
    } catch (error) {
      setStats({ error: error instanceof Error ? error.message : 'Erreur inconnue' })
    } finally {
      setLoading(false)
    }
  }

  // Test de toutes les tables
  const testAllTables = async () => {
    setLoading(true)
    try {
      const tablesData = await supabaseRedisManager.testAllRedisTablesConnection()
      setTablesTest(tablesData)
    } catch (error) {
      setTablesTest({ error: error instanceof Error ? error.message : 'Erreur inconnue' })
    } finally {
      setLoading(false)
    }
  }

  // Test des sessions
  const testSessions = async () => {
    setLoading(true)
    try {
      const sessionsData = await supabaseRedisManager.getRedisSessionsWithMessages()
      setSessions(sessionsData)
    } catch (error) {
      setSessions([])
      console.error('Erreur sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Test automatique au chargement
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Diagnostic Redis</h2>
      
      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle>Connexion Redis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Statut :</span>
            <span className={`font-medium ${
              connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus}
            </span>
          </div>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Test en cours...' : 'Tester la connexion'}
          </Button>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques Redis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testStats} disabled={loading}>
            {loading ? 'Chargement...' : 'Obtenir les statistiques'}
          </Button>
          
          {stats && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test des tables */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Tables Redis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAllTables} disabled={loading}>
            {loading ? 'Test en cours...' : 'Tester toutes les tables'}
          </Button>
          
          {tablesTest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Résultats des tests :</h4>
              <pre className="text-sm">
                {JSON.stringify(tablesTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions Redis */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions dans Redis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testSessions} disabled={loading}>
            {loading ? 'Chargement...' : 'Lister les sessions'}
          </Button>
          
          {sessions.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium">Sessions trouvées : {sessions.length}</h4>
              {sessions.map((session, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <strong>Clé :</strong> {session.session_key}
                  </div>
                  <div className="text-sm">
                    <strong>Messages :</strong> {session.message_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune session trouvée dans Redis</p>
          )}
        </CardContent>
      </Card>

      {/* Informations de configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>URL Redis :</strong> redis-14881.c339.eu-west-3-1.ec2.redns.redis-cloud.com:14881</div>
            <div><strong>Type :</strong> Redis Cloud</div>
            <div><strong>Schema :</strong> redis_chat</div>
            <div><strong>Wrapper :</strong> redis_wrapper</div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => {
                testConnection()
                testStats()
                testAllTables()
              }}
              disabled={loading}
              className="w-full"
            >
              Test Complet
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setConnectionStatus('Non testé')
                setStats(null)
                setTablesTest(null)
                setSessions([])
              }}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}