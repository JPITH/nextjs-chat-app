# Application Next.js Chat avec n8n et Redis

## 📁 Structure du projet

```
nextjs-chat-app/
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── signin/
│   │       │   │   └── route.ts
│   │       │   └── signup/
│   │       │       └── route.ts
│   │       ├── chat/
│   │       │   ├── [sessionId]/
│   │       │   │   └── route.ts
│   │       │   ├── sessions/
│   │       │   │   └── route.ts
│   │       │   └── webhook/
│   │       │       └── route.ts
│   │       └── sse/
│   │           └── [sessionId]/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── dashboard/
│   │   │   └── SessionsList.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Navigation.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── chat.ts
│   └── middleware.ts
└── docker-compose.yml              # Pour Redis local
```

## 🚀 Installation et configuration

### 1. Initialisation du projet

```bash
# Créer le projet
npx create-next-app@latest nextjs-chat-app --typescript --tailwind --eslint --app
cd nextjs-chat-app

# Installer les dépendances
pnpm add redis jsonwebtoken bcryptjs uuid
pnpm add -D @types/jsonwebtoken @types/bcryptjs @types/uuid

# Copier les variables d'environnement
cp .env.example .env.local
```

### 2. Variables d'environnement (.env.local)

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# n8n Webhook
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat-response

# Next.js
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Démarrer Redis avec Docker

```bash
# Créer et démarrer Redis
docker-compose up -d redis

# Vérifier que Redis fonctionne
docker-compose logs redis
```

### 4. Configuration n8n

1. Créer un workflow n8n avec un webhook trigger
2. URL du webhook : `http://localhost:5678/webhook/chat-response`
3. Configurer le workflow pour traiter les messages et renvoyer une réponse
4. Le webhook doit recevoir : `{ sessionId, message, userId }`
5. Le webhook doit renvoyer : `{ sessionId, response, timestamp }`

### 5. Lancement

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

## 📱 Fonctionnalités

### Authentification
- Inscription/Connexion avec email/mot de passe
- JWT pour la gestion des sessions
- Middleware de protection des routes

### Chat
- Interface de chat en temps réel
- Intégration avec webhook n8n
- Historique stocké dans Redis
- Server-Sent Events pour les mises à jour temps réel

### Dashboard
- Liste des sessions de chat
- Création de nouvelles sessions
- Navigation vers les chats existants

## 🔧 Configuration

### Redis Structure
```
chat:session:{sessionId} -> JSON des messages
chat:sessions:{userId} -> Set des sessionIds
user:{userId} -> JSON des données utilisateur
```

### API Endpoints
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signup` - Inscription  
- `GET /api/chat/sessions` - Liste des sessions
- `POST /api/chat/sessions` - Créer une session
- `GET /api/chat/[sessionId]` - Messages d'une session
- `POST /api/chat/[sessionId]` - Envoyer un message
- `GET /api/sse/[sessionId]` - Server-Sent Events
- `POST /api/chat/webhook` - Webhook n8n

## 🎨 Interface

L'application utilise Tailwind CSS avec un design moderne et responsive :
- Landing page attractive
- Formulaires d'authentification
- Dashboard avec liste des chats
- Interface de chat intuitive
- Thème sombre/clair (optionnel)

## 🔒 Sécurité

- Hachage des mots de passe avec bcrypt
- JWT pour l'authentification
- Middleware de protection des routes
- Validation des données côté serveur
- Rate limiting (recommandé en production)

## 📊 Monitoring

- Logs des erreurs
- Métriques Redis
- Monitoring des webhooks n8n

## 🚀 Déploiement

### Vercel
```bash
pnpm build
vercel --prod
```

### Docker
```bash
docker build -t nextjs-chat-app .
docker run -p 3000:3000 nextjs-chat-app
```

## 🛠️ Développement

### Scripts disponibles
```bash
pnpm dev          # Développement
pnpm build        # Build production
pnpm start        # Démarrer en production
pnpm lint         # Linter
pnpm type-check   # Vérification TypeScript
```

### Tests
```bash
pnpm test         # Tests unitaires
pnpm test:e2e     # Tests E2E
```

## 📝 Notes

- L'application utilise l'App Router de Next.js 13+
- Redis est utilisé pour le stockage des sessions et l'historique
- Les messages sont traités via webhook n8n
- Server-Sent Events pour les mises à jour temps réel
- Interface responsive avec Tailwind CSS

## 🆘 Troubleshooting

### Redis connection
```bash
# Vérifier Redis
redis-cli ping

# Voir les logs
docker-compose logs redis
```

### n8n webhook
- Vérifier que n8n est démarré
- Tester le webhook avec curl
- Vérifier les logs n8n

### JWT errors
- Vérifier JWT_SECRET dans .env.local
- Régénérer le token si nécessaire