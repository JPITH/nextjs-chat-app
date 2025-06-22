// src/app/api/webhook/n8n/route.ts - Version avec Redis pour l'IA

import { NextRequest, NextResponse } from 'next/server'
import { redisManager } from '@/lib/redis-supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message, userId } = body;

    if (!sessionId || !message || !userId) {
      return NextResponse.json(
        { error: 'sessionId, message et userId requis' },
        { status: 400 }
      );
    }

    // Configuration du webhook n8n
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const username = process.env.N8N_WEBHOOK_USER;
    const password = process.env.N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl || !username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration n8n manquante' 
      }, { status: 500 });
    }

    // ================ PRÉPARATION DU CONTEXTE POUR L'IA ================
    
    // 1. Récupérer l'historique depuis Redis
    const messageHistory = await redisManager.getMessagesForAI(sessionId, 20);
    
    // 2. Récupérer le contexte IA
    const aiContext = await redisManager.getAIContext(sessionId);
    
    // 3. Préparer le payload enrichi pour n8n
    const enrichedPayload = {
      sessionId,
      userId,
      message,
      timestamp: new Date().toISOString(),
      
      // Contexte pour l'IA
      context: {
        message_history: messageHistory,
        ai_context: aiContext,
        session_metadata: {
          total_messages: messageHistory.length,
          last_activity: new Date().toISOString()
        }
      }
    };

    console.log('Envoi webhook n8n avec contexte:', {
      sessionId,
      userId,
      message,
      historyLength: messageHistory.length,
      hasAIContext: !!aiContext
    });

    // ================ ENVOI À N8N ================
    
    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
        'Origin': 'http://localhost:3000',
        'User-Agent': 'ChatApp/1.0',
      },
      body: JSON.stringify(enrichedPayload),
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

// ================ ROUTE POUR RECEVOIR LES RÉPONSES N8N ================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      response, 
      timestamp,
      ai_context_update, // Nouveau contexte IA à sauvegarder
      conversation_summary // Résumé de conversation
    } = body

    if (!sessionId || !response) {
      return NextResponse.json(
        { error: 'sessionId et response requis' },
        { status: 400 }
      )
    }

    console.log('Réponse n8n reçue:', { sessionId, responseLength: response.length });

    // ================ SAUVEGARDER LA RÉPONSE ================
    
    const assistantMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      content: response,
      sender: 'assistant' as const,
      timestamp: timestamp || new Date().toISOString(),
    }

    // Sauvegarder en Supabase ET Redis
    await redisManager.saveMessage(assistantMessage)

    // ================ METTRE À JOUR LE CONTEXTE IA ================
    
    if (ai_context_update || conversation_summary) {
      await redisManager.saveAIContext(sessionId, {
        summary: conversation_summary,
        conversation_state: ai_context_update?.state,
        user_preferences: ai_context_update?.preferences,
        topics: ai_context_update?.topics
      })
    }

    console.log('Message assistant sauvegardé avec contexte IA mis à jour');

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse n8n traitée et contexte IA mis à jour' 
    });

  } catch (error) {
    console.error('Erreur traitement réponse n8n:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// ================ ROUTE POUR SYNCHRONISER REDIS ================

export async function PATCH(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      )
    }

    await redisManager.syncRedisWithSupabase(sessionId)

    return NextResponse.json({ 
      success: true, 
      message: 'Synchronisation Redis terminée' 
    });

  } catch (error) {
    console.error('Erreur synchronisation:', error);
    return NextResponse.json(
      { error: 'Erreur synchronisation' },
      { status: 500 }
    );
  }
}