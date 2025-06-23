// src/app/api/webhook/n8n/route.ts - Version simplifiée
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, message, userId } = body;

    if (!bookId || !message || !userId) {
      return NextResponse.json(
        { error: 'bookId, message et userId requis' },
        { status: 400 }
      );
    }

    // Configuration simple du webhook n8n
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER;
    const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'Webhook n8n non configuré' 
      }, { status: 500 });
    }

    // Payload simple pour n8n
    const payload = {
      bookId,
      userId,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('Envoi vers n8n:', { webhookUrl, payload });

    // Appel webhook sans authentification si pas configurée
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChatApp/1.0'
    };

    if (username && password) {
      const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = basicAuth;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Erreur webhook n8n:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      
      // Ne pas faire échouer si n8n ne répond pas
      return NextResponse.json({ 
        success: true, 
        message: 'Message envoyé mais n8n indisponible',
        webhookError: `${webhookResponse.status}: ${errorText}`
      });
    }

    const result = await webhookResponse.json().catch(() => ({}));
    console.log('Réponse n8n:', result);

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('Erreur API webhook:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Route simplifiée pour recevoir les réponses n8n
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, response, timestamp } = body

    if (!bookId || !response) {
      return NextResponse.json(
        { error: 'bookId et response requis' },
        { status: 400 }
      )
    }

    console.log('Réponse n8n reçue pour livre:', bookId);

    // Sauvegarder la réponse de l'IA
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: response,
      created_at: timestamp || new Date().toISOString(),
      updated_at: timestamp || new Date().toISOString(),
    }

    const supabase = createClient();
    const { error: messageError } = await supabase
      .from('book_chat')
      .insert(assistantMessage);

    if (messageError) {
      console.error('Erreur sauvegarde réponse IA:', messageError);
      return NextResponse.json(
        { error: 'Erreur sauvegarde message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse IA sauvegardée' 
    });

  } catch (error) {
    console.error('Erreur traitement réponse n8n:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}