import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'magiclink' | 'recovery' | 'email_change' | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type 
    })
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Rediriger vers une page d'erreur en cas d'échec
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
