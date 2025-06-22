// src/lib/supabase-server.ts (fonctions serveur uniquement)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from './supabase'

// Client pour les composants côté serveur
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Client pour les route handlers
export function createRouteHandlerClient(request: Request) {
  const requestHeaders = new Headers(request.headers)
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = requestHeaders.get('cookie')
          return cookies ? cookies.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          }) : []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieValue = `${name}=${value}; Path=${options?.path || '/'}; ${
              options?.httpOnly ? 'HttpOnly; ' : ''
            }${options?.secure ? 'Secure; ' : ''}${
              options?.sameSite ? `SameSite=${options.sameSite}; ` : ''
            }${options?.maxAge ? `Max-Age=${options.maxAge}; ` : ''}`
            
            requestHeaders.set('set-cookie', cookieValue)
          })
        },
      },
    }
  )
}