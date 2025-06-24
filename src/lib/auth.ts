'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function signOut() {
  const supabase = createServerComponentClient({ cookies });
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  return { success: true };
}

export async function getSession() {
  const supabase = createServerComponentClient({ cookies });
  return await supabase.auth.getSession();
}

export async function getUser() {
  const supabase = createServerComponentClient({ cookies });
  return await supabase.auth.getUser();
}
