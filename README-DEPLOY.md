// README-DEPLOY.md (instructions de déploiement)
# 🚀 Guide de déploiement ChatApp

## Déploiement Vercel (Recommandé)

### 1. Prérequis
- Compte Vercel
- Repository Git (GitHub, GitLab, Bitbucket)
- Redis cloud (Upstash, Redis Cloud, ou autre)

### 2. Configuration Redis Cloud
```bash
# Exemple avec Upstash
# 1. Créer un compte sur https://upstash.com
# 2. Créer une base Redis
# 3. Récupérer l'URL de connexion
REDIS_URL=rediss://default:password@host:port
```

### 3. Déploiement
```bash
# 1. Connecter votre repo à Vercel
vercel --prod

# 2. Configurer les variables d'environnement dans Vercel UI:
# - JWT_SECRET
# - REDIS_URL  
# - N8N_WEBHOOK_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

## Déploiement Docker

### 1. Build et run
```bash
# Build l'image
docker build -t chatapp .

# Run avec docker-compose
docker-compose up -d
```

### 2. Configuration production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
      - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

## Configuration n8n Production

### 1. n8n Cloud
- Utiliser n8n Cloud pour la simplicité
- Importer le workflow depuis `scripts/n8n-workflow.json`
- Configurer l'URL webhook dans les variables d'environnement

### 2. n8n Self-hosted
```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Ou avec docker-compose
# Voir docker-compose.yml pour la config complète
```

## Variables d'environnement Production

```bash
# Sécurité
JWT_SECRET=your-super-long-random-secret-key-256-bits
NEXTAUTH_SECRET=another-long-random-secret-key

# URLs
NEXTAUTH_URL=https://your-domain.com
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-response

# Redis
REDIS_URL=rediss://username:password@host:port

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

## Monitoring et Logs

### 1. Logs applicatifs
```bash
# Vercel
vercel logs

# Docker
docker-compose logs -f app
```

### 2. Monitoring Redis
```bash
# Connexion Redis
redis-cli -u $REDIS_URL

# Monitoring
redis-cli -u $REDIS_URL monitor
```

## Sécurité Production

### 1. HTTPS obligatoire
- Toujours utiliser HTTPS en production
- Configurer les headers de sécurité

### 2. Rate limiting
```typescript
// Ajouter dans middleware.ts
import rateLimit from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Rate limiting
  const identifier = request.ip ?? 'anonymous';
  const { success } = await rateLimit.limit(identifier);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // ... rest of middleware
}
```

### 3. Validation des inputs
- Toujours valider côté serveur
- Sanitiser les messages utilisateur
- Limiter la taille des messages

## Performance

### 1. Redis optimisation
```bash
# Configuration Redis production
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### 2. Next.js optimisation
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    outputStandalone: true,
  },
}
```

## Troubleshooting

### 1. Erreurs communes
```bash
# JWT Invalid
# -> Vérifier JWT_SECRET en production

# Redis connexion
# -> Vérifier REDIS_URL et credentials

# n8n webhook timeout
# -> Vérifier la latence réseau et timeout n8n
```

### 2. Debug
```bash
# Activer les logs détaillés
DEBUG=* pnpm dev

# Monitoring Redis
redis-cli -u $REDIS_URL --latency-history
```

// CHANGELOG.md
# 📝 Changelog ChatApp

## [1.0.0] - 2024-01-01

### ✨ Ajouté
- **Authentification complète** avec JWT et bcrypt
- **Interface de chat temps réel** avec Server-Sent Events
- **Intégration n8n** pour le traitement des messages
- **Stockage Redis** pour sessions et historique
- **Dashboard utilisateur** avec gestion des conversations
- **Landing page moderne** avec design Tailwind CSS
- **API REST complète** pour toutes les fonctionnalités
- **Middleware de sécurité** pour la protection des routes
- **Interface responsive** compatible mobile/desktop

### 🔧 Technique
- **Next.js 14** avec App Router
- **TypeScript** pour la type safety
- **Tailwind CSS** pour le styling
- **Redis** pour le cache et stockage
- **Docker Compose** pour l'environnement local
- **SSE** pour les mises à jour temps réel

### 📦 Structure
- Architecture modulaire et scalable
- Composants réutilisables
- API routes organisées
- Types TypeScript complets
- Documentation complète

### 🚀 Déploiement
- Compatible Vercel
- Support Docker
- Configuration production
- Variables d'environnement sécurisées

---

## Roadmap Future

### 🎯 Version 1.1.0
- [ ] Tests unitaires et E2E
- [ ] Internationalisation (i18n)
- [ ] Thème sombre
- [ ] Notifications push
- [ ] Upload de fichiers

### 🎯 Version 1.2.0
- [ ] Recherche dans l'historique
- [ ] Export des conversations
- [ ] Sharing de conversations
- [ ] API publique
- [ ] Plugin système

### 🎯 Version 2.0.0
- [ ] Multi-utilisateurs par conversation
- [ ] Rooms et channels
- [ ] Video/Audio calling
- [ ] Intégrations tierces avancées
- [ ] Analytics et reporting