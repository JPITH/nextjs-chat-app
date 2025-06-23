// 1. Corriger src/app/api/webhook/n8n/route.ts
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

    // Configuration du webhook n8n
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER;
    const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl || !username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration n8n manquante' 
      }, { status: 500 });
    }

    // Préparer le payload pour n8n
    const payload = {
      bookId,
      userId,
      message,
      timestamp: new Date().toISOString()
    };

    console.log('Envoi webhook n8n:', payload);
    
    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
        'Origin': 'http://localhost:3000',
        'User-Agent': 'ChatApp/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Erreur webhook n8n:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      return NextResponse.json({ 
        success: false, 
        message: `Erreur webhook n8n: ${webhookResponse.status}`,
        details: errorText
      }, { status: 500 });
    }

    const result = await webhookResponse.json();
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

// Route pour recevoir les réponses n8n
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      bookId, 
      response, 
      timestamp
    } = body

    if (!bookId || !response) {
      return NextResponse.json(
        { error: 'bookId et response requis' },
        { status: 400 }
      )
    }

    console.log('Réponse n8n reçue:', { bookId, responseLength: response.length });

    // Sauvegarder la réponse assistant
    const assistantMessage = {
      id: crypto.randomUUID(),
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
      console.error('Erreur sauvegarde message assistant:', messageError);
      return NextResponse.json(
        { error: 'Erreur sauvegarde message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse n8n traitée' 
    });

  } catch (error) {
    console.error('Erreur traitement réponse n8n:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
