// src/app/api/books/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Obtenir l'utilisateur depuis l'en-tête ou la session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération livres:', error);
      return NextResponse.json(
        { error: 'Erreur récupération livres' },
        { status: 500 }
      );
    }

    return NextResponse.json({ books: books || [] });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Titre requis' },
        { status: 400 }
      );
    }

    const newBook = {
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      chapter_count: 0,
    };

    const { data: book, error } = await supabase
      .from('books')
      .insert(newBook)
      .select()
      .single();

    if (error) {
      console.error('Erreur création livre:', error);
      return NextResponse.json(
        { error: 'Erreur création livre' },
        { status: 500 }
      );
    }

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
