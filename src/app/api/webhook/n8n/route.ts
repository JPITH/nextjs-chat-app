// src/app/api/webhook/n8n/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import type { WebhookPayload, WebhookResponse } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();
    const { bookId, message, timestamp } = body;

    if (!bookId || !message) {
      return NextResponse.json(
        { error: 'bookId et response requis' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Sauvegarder la réponse de l'IA
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: message,
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (messageError) {
      console.error('Erreur sauvegarde message:', messageError);
      return NextResponse.json(
        { error: 'Erreur sauvegarde message' },
        { status: 500 }
      );
    }

    const webhookResponse: WebhookResponse = {
      success: true,
      message: 'Réponse IA sauvegardée',
      data: {
        messageId: savedMessage.id,
        bookId,
        wordCount: message.split(' ').length,
        timestamp: savedMessage.created_at
      }
    };

    return NextResponse.json(webhookResponse);

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}