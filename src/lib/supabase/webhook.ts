// src/lib/supabase/webhook.ts - Client Supabase pour les webhooks avec service role
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Client Supabase avec service role pour bypasser RLS dans les webhooks
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!serviceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY manquante - utilisation de la clé anon');
    return createClient<Database>(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}