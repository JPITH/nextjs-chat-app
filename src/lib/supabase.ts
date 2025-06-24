// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        heartbeatIntervalMs: 30000,
        timeout: 20000,
      }
    }
  );
}

export const supabase = createClient();