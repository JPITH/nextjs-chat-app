// src/config/env.ts

// Fonction pour obtenir une variable d'environnement avec une valeur par défaut optionnelle
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue
  
  if (typeof value === 'undefined') {
    if (typeof defaultValue !== 'undefined') {
      return defaultValue
    }
    throw new Error(`Variable d'environnement manquante: ${key}`)
  }
  
  return value
}

// Fonction pour obtenir une variable d'environnement booléenne
const getBoolEnv = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]
  if (typeof value === 'undefined') return defaultValue
  return value === 'true' || value === '1'
}

// Fonction pour obtenir une variable d'environnement numérique
const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key]
  if (typeof value === 'undefined') return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Configuration de l'application
export const config = {
  // Configuration Supabase
  supabase: {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    storageBucket: getEnv('NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET', 'public'),
  },
  
  // Configuration JWT
  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  },
  
  // Configuration de l'application
  app: {
    env: getEnv('NODE_ENV', 'development'),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
    url: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  },
  
  // Configuration des logs
  logs: {
    level: getEnv('LOG_LEVEL', 'info'),
    enableRequestLogging: getBoolEnv('ENABLE_REQUEST_LOGGING', true),
  },
  
  // Configuration du taux limite
  rateLimit: {
    windowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    max: getNumberEnv('RATE_LIMIT_MAX_REQUESTS', 100), // 100 requêtes par fenêtre
  },
  
  // Configuration des webhooks
  webhooks: {
    n8n: {
      url: getEnv('N8N_WEBHOOK_URL', ''),
      user: getEnv('N8N_WEBHOOK_USER', ''),
      password: getEnv('N8N_WEBHOOK_PASSWORD', ''),
    },
  },
  
  // Configuration email
  email: {
    smtp: {
      host: getEnv('SMTP_HOST', ''),
      port: getNumberEnv('SMTP_PORT', 587),
      user: getEnv('SMTP_USER', ''),
      password: getEnv('SMTP_PASSWORD', ''),
      from: getEnv('SMTP_FROM', 'noreply@example.com'),
    },
  },
}

// Types pour la configuration
export type Config = typeof config
