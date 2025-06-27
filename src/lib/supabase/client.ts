import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Les cookies côté client sont accessibles directement via document.cookie
          const cookies = document.cookie.split('; ');
          const cookie = cookies.find((row) => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : undefined;
        },
        set(name: string, value: string, options: any) {
          try {
            document.cookie = `${name}=${value}${options?.domain ? `; Domain=${options.domain}` : ''}${options?.maxAge ? `; Max-Age=${options.maxAge}` : ''}${options?.path ? `; Path=${options.path}` : ''}${options?.httpOnly ? '; HttpOnly' : ''}${options?.secure ? '; Secure' : ''}${options?.sameSite ? `; SameSite=${options.sameSite}` : ''}`;
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            document.cookie = `${name}=; Max-Age=0${options?.domain ? `; Domain=${options.domain}` : ''}${options?.path ? `; Path=${options.path}` : ''}`;
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}
