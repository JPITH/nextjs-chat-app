// src/app/api/webhook/n8n/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Mapping pour compatibilité avec le front
    const { sessionId, message, userId } = body;
    const session_id = sessionId;
    const user_id = userId;

    if (!session_id || !message || !user_id) {
      return NextResponse.json(
        { error: 'session_id, message et user_id requis' },
        { status: 400 }
      );
    }

    // Préparation des variables d'authentification
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const username = process.env.N8N_WEBHOOK_USER;
    const password = process.env.N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl || !username || !password) {
      return NextResponse.json({ success: false, message: 'Configuration n8n manquante' }, { status: 500 });
    }

    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    // Envoi au webhook n8n avec Basic Auth
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
        'Origin': 'http://localhost:3000', // adapte si besoin
      },
      body: JSON.stringify({ session_id, user_id, message }),
    });

    if (!webhookResponse.ok) {
      console.error('Erreur webhook n8n:', webhookResponse.status, webhookResponse.statusText)
      return NextResponse.json({ 
        success: false, 
        message: 'Erreur webhook n8n' 
      }, { status: 500 })
    }

    const result = await webhookResponse.json()
    console.log('Réponse n8n:', result)

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Erreur API webhook:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Route pour recevoir les réponses de n8n
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, response, timestamp } = body

    if (!sessionId || !response) {
      return NextResponse.json(
        { error: 'sessionId et response requis' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Créer le message de l'assistant
    const assistantMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      content: response,
      sender: 'assistant' as const,
      timestamp: timestamp || new Date().toISOString(),
    }

    // Sauvegarder en base
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert(assistantMessage)

    if (messageError) {
      console.error('Erreur sauvegarde message assistant:', messageError)
      return NextResponse.json(
        { error: 'Erreur sauvegarde message' },
        { status: 500 }
      )
    }

    // Mettre à jour le compteur de messages de la session
    const { error: updateError } = await supabase.rpc('increment_message_count', {
      session_id: sessionId
    })

    if (updateError) {
      console.warn('Erreur mise à jour compteur:', updateError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message assistant sauvegardé' 
    })

  } catch (error) {
    console.error('Erreur réception réponse n8n:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}