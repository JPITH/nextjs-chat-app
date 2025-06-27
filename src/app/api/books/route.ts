// src/app/api/books/route.ts (RENOMMER le fichier routes.ts en route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération livres:', error);
      return NextResponse.json({ error: 'Erreur récupération livres' }, { status: 500 });
    }

    return NextResponse.json({ books: books || [] });
  } catch (error) {
    console.error('Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, genre, target_words } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    }

    const newBook = {
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      genre: genre || null,
      target_words: target_words || null,
    };

    const { data: book, error } = await supabase
      .from('books')
      .insert(newBook)
      .select()
      .single();

    if (error) {
      console.error('Erreur création livre:', error);
      return NextResponse.json({ error: 'Erreur création livre' }, { status: 500 });
    }

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}