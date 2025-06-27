import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Dans Next.js 15+, cookies() retourne une promesse
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          try {
            // Utilisation de la méthode asynchrone pour obtenir le cookie
            const allCookies = cookieStore.getAll()
            const cookie = allCookies.find(c => c.name === name)
            return cookie?.value
          } catch (error) {
            console.error('Error getting cookie:', error)
            return null
          }
        },
        async set(name: string, value: string, options: any) {
          try {
            // Utilisation de la méthode asynchrone pour définir un cookie
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              // Assurez-vous que les options de sécurité sont définies
              httpOnly: options?.httpOnly ?? true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        async remove(name: string, options: any) {
          try {
            // Utilisation de la méthode asynchrone pour supprimer un cookie
            cookieStore.set({ 
              name, 
              value: '', 
              ...options, 
              maxAge: 0,
              // Assurez-vous que les options de sécurité sont définies
              httpOnly: options?.httpOnly ?? true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        }
      }
    }
  )
}
