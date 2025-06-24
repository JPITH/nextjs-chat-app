// src/app/api/books/webhook/route.ts - Version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface WebhookRequestBody {
  sessionId?: string;
  bookId?: string;
  response: string;
  timestamp?: string;
  metadata?: any;
}

interface Message {
  id: string;
  book_id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookRequestBody = await request.json();
    const { sessionId, bookId, response, timestamp } = body;

    // Validation - soit sessionId soit bookId requis
    if (!sessionId && !bookId) {
      return NextResponse.json(
        { error: 'sessionId ou bookId requis' },
        { status: 400 }
      );
    }

    if (!response) {
      return NextResponse.json(
        { error: 'response requis' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Si bookId est fourni, utiliser la nouvelle structure (livres)
    if (bookId) {
      const assistantMessage: Omit<Message, 'id'> = {
        book_id: bookId,
        title: 'Réponse Assistant',
        content: response,
        created_at: timestamp || new Date().toISOString(),
        updated_at: timestamp || new Date().toISOString(),
      };

      const { data: savedMessage, error: messageError } = await supabase
        .from('book_chat')
        .insert(assistantMessage)
        .select()
        .single();

      if (messageError) {
        console.error('Erreur sauvegarde message:', messageError);
        return NextResponse.json({
          error: 'Erreur sauvegarde message',
          details: messageError.message
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Réponse IA sauvegardée',
        data: {
          messageId: savedMessage.id,
          bookId,
          wordCount: response.split(' ').length,
          timestamp: savedMessage.created_at
        }
      });
    }

    // Ancienne logique pour sessionId (pour compatibilité)
    if (sessionId) {
      console.warn('SessionId utilisé - structure obsolète');
      return NextResponse.json({
        success: true,
        message: 'Structure sessionId obsolète - utilisez bookId'
      });
    }

    return NextResponse.json(
      { error: 'Paramètres invalides' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error.message 
      },
      { status: 500 }
    );
  }
}