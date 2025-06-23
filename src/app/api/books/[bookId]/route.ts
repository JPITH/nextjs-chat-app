// 2. Corriger src/app/api/books/[bookId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{
    bookId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bookId } = await context.params;
    const supabase = createClient();
    
    // Récupérer les messages du livre
    const { data: messages, error } = await supabase
      .from('book_chat')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur récupération messages:', error);
      return NextResponse.json(
        { error: 'Erreur récupération messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bookId } = await context.params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Sauvegarder le message utilisateur
    const userMessage = {
      id: crypto.randomUUID(),
      book_id: bookId,
      title: 'Message utilisateur',
      content: message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: messageError } = await supabase
      .from('book_chat')
      .insert(userMessage);

    if (messageError) {
      console.error('Erreur sauvegarde message:', messageError);
      return NextResponse.json(
        { error: 'Erreur sauvegarde message' },
        { status: 500 }
      );
    }

    // Envoyer à n8n
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (webhookUrl) {
        const webhookPayload = {
          bookId,
          message,
          timestamp: new Date().toISOString(),
        };

        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        }).catch(error => {
          console.error('Webhook error:', error);
        });
      }
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: userMessage 
    });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}