// src/app/api/books/[bookId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = createClient();
    
    const { data: messages, error } = await supabase
      .from('book_chat')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Erreur récupération messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = createClient();
    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Sauvegarder le message utilisateur
    const userMessage = {
      book_id: bookId,
      title: 'Message utilisateur',
      content: message.trim(),
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('book_chat')
      .insert(userMessage)
      .select()
      .single();

    if (messageError) {
      return NextResponse.json({ error: 'Erreur sauvegarde message' }, { status: 500 });
    }

    // Appeler n8n en arrière-plan
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => console.error('Webhook error:', error));
    }

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Supprimer d'abord tous les messages du livre
    const { error: chatError } = await supabase
      .from('book_chat')
      .delete()
      .eq('book_id', bookId);

    if (chatError) {
      console.error('Erreur suppression messages:', chatError);
    }

    // Puis supprimer le livre
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', user.id);

    if (bookError) {
      return NextResponse.json({ error: 'Erreur suppression livre' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}