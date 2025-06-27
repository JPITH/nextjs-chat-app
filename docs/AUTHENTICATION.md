# Authentification avec Supabase et Next.js 15+

Ce document explique comment l'authentification est implémentée dans l'application Next.js 15+ avec Supabase.

## Architecture d'authentification

L'application utilise une architecture hybride qui combine :
- **Supabase Auth** pour la gestion des utilisateurs et des sessions
- **Cookies HTTP-Only** pour le stockage sécurisé des jetons
- **Middleware** pour la protection des routes
- **API Routes** pour les opérations d'authentification côté serveur

## Configuration requise

### Variables d'environnement

Assurez-vous d'avoir configuré ces variables dans votre fichier `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sécurité
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# URL de l'application (pour les liens d'email)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Flux d'authentification

### 1. Inscription

1. L'utilisateur remplit le formulaire d'inscription
2. La fonction `signUp` est appelée avec l'email et le mot de passe
3. Supabase crée un nouvel utilisateur et envoie un email de confirmation
4. L'utilisateur confirme son email en cliquant sur le lien reçu
5. Le middleware gère la confirmation et connecte automatiquement l'utilisateur

### 2. Connexion

1. L'utilisateur remplit le formulaire de connexion
2. La fonction `signIn` est appelée avec l'email et le mot de passe
3. Supabase valide les identifiants et renvoie une session
4. La session est stockée dans un cookie HTTP-Only sécurisé
5. L'utilisateur est redirigé vers le tableau de bord

### 3. Déconnexion

1. L'utilisateur clique sur le bouton de déconnexion
2. La fonction `signOut` est appelée
3. Le cookie de session est supprimé
4. L'utilisateur est redirigé vers la page de connexion

## Protection des routes

Le fichier `middleware.ts` protège les routes en fonction de l'état d'authentification :

- **Routes protégées** (`/dashboard`, `/profile`, etc.) :
  - Redirigent vers `/auth/signin` si l'utilisateur n'est pas connecté
  - Affichent la page demandée si l'utilisateur est connecté

- **Routes d'authentification** (`/auth/signin`, `/auth/signup`, etc.) :
  - Redirigent vers `/dashboard` si l'utilisateur est déjà connecté
  - Affichent le formulaire d'authentification si l'utilisateur n'est pas connecté

## Fonctions d'aide

### `createClient()`

Crée une instance du client Supabase avec gestion des cookies.

```typescript
import { createClient } from '@/lib/supabase/server'

// Dans une fonction asynchrone
const supabase = await createClient()
```

### `signIn(email: string, password: string)`

Connecte un utilisateur avec son email et son mot de passe.

```typescript
import { signIn } from '@/lib/auth'

const { user, error } = await signIn('user@example.com', 'password')
```

### `signUp(email: string, password: string, name?: string)`

Crée un nouveau compte utilisateur.

```typescript
import { signUp } from '@/lib/auth'

const { user, error } = await signUp('user@example.com', 'password', 'John Doe')
```

### `signOut()`

Déconnecte l'utilisateur actuel.

```typescript
import { signOut } from '@/lib/auth'

const { error } = await signOut()
```

### `getSession()`

Récupère la session actuelle de l'utilisateur.

```typescript
import { getSession } from '@/lib/auth'

const { session, error } = await getSession()
```

### `getUser()`

Récupère les informations de l'utilisateur actuel.

```typescript
import { getUser } from '@/lib/auth'

const { user, error } = await getUser()
```

## Gestion des erreurs

Toutes les fonctions d'authentification renvoient un objet avec une propriété `error` en cas d'échec. Vérifiez toujours cette propriété avant de procéder.

```typescript
const { user, error } = await signIn(email, password)

if (error) {
  // Afficher l'erreur à l'utilisateur
  console.error(error.message)
  return
}

// L'authentification a réussi
router.push('/dashboard')
```

## Personnalisation

### Personnalisation des emails

Vous pouvez personnaliser les emails d'authentification dans le tableau de bord Supabase (Authentication > Email Templates).

### Personnalisation des pages d'authentification

Les pages d'authentification se trouvent dans `src/app/auth/`. Vous pouvez les modifier selon vos besoins tout en conservant la logique d'authentification existante.

## Dépannage

### L'utilisateur n'est pas redirigé après la connexion

1. Vérifiez que `NEXT_PUBLIC_APP_URL` est correctement défini dans `.env.local`
2. Assurez-vous que les URLs de redirection autorisées sont correctement configurées dans le tableau de bord Supabase

### Les sessions ne persistent pas

1. Vérifiez que les cookies sont correctement définis dans les en-têtes de réponse
2. Assurez-vous que le domaine des cookies est correctement configuré pour votre environnement

### Erreurs CORS

1. Vérifiez que les URLs autorisées sont correctement configurées dans le tableau de bord Supabase
2. Assurez-vous que `NEXT_PUBLIC_SUPABASE_URL` correspond exactement à l'URL de votre projet Supabase

## Sécurité

- Les cookies sont configurés avec les attributs `HttpOnly`, `Secure` et `SameSite=Lax`
- Les jetons d'actualisation sont utilisés pour maintenir les sessions
- Les mots de passe sont hachés de manière sécurisée par Supabase
- Toutes les communications avec Supabase utilisent HTTPS

## Références

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Bonnes pratiques d'authentification OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
