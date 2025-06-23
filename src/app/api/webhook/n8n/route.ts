// src/app/api/webhook/n8n/route.ts - Version avec debug avancé
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Interface pour les logs de debug
interface WebhookLog {
  timestamp: string;
  type: 'REQUEST' | 'RESPONSE' | 'ERROR';
  data: any;
}

// Stockage temporaire des logs (en production, utiliser une vraie DB)
const webhookLogs: WebhookLog[] = [];

function addLog(type: WebhookLog['type'], data: any) {
  webhookLogs.push({
    timestamp: new Date().toISOString(),
    type,
    data
  });
  
  // Garder seulement les 50 derniers logs
  if (webhookLogs.length > 50) {
    webhookLogs.shift();
  }
}

// Route pour consulter les logs de debug
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug');
  
  if (debug === 'logs') {
    return NextResponse.json({
      logs: webhookLogs,
      total: webhookLogs.length,
      lastUpdate: webhookLogs[webhookLogs.length - 1]?.timestamp || 'Never'
    });
  }
  
  return NextResponse.json({ 
    status: 'Webhook n8n actif',
    endpoints: {
      send: 'POST /api/webhook/n8n',
      receive: 'PUT /api/webhook/n8n',
      logs: 'GET /api/webhook/n8n?debug=logs'
    }
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    addLog('REQUEST', { 
      url: request.url,
      method: 'POST',
      body,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    console.log('=== WEBHOOK N8N ENVOI ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body reçu:', JSON.stringify(body, null, 2));
    
    const { bookId, message, userId } = body;

    // Validation des paramètres
    if (!bookId || !message || !userId) {
      const error = { error: 'Paramètres manquants', received: { bookId, message, userId } };
      addLog('ERROR', error);
      console.error('❌ Paramètres manquants:', error);
      return NextResponse.json(error, { status: 400 });
    }

    // Configuration webhook n8n avec fallback
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER || process.env.N8N_WEBHOOK_USER;
    const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || process.env.N8N_WEBHOOK_PASSWORD;

    console.log('🔧 Configuration n8n:', {
      url: webhookUrl ? `${webhookUrl.substring(0, 30)}...` : 'NON DÉFINI',
      hasAuth: !!(username && password),
      username: username ? `${username.substring(0, 3)}***` : 'NON DÉFINI'
    });

    if (!webhookUrl) {
      const error = { error: 'NEXT_PUBLIC_N8N_WEBHOOK_URL non configuré' };
      addLog('ERROR', error);
      console.error('❌', error.error);
      return NextResponse.json(error, { status: 500 });
    }

    // Payload enrichi pour n8n
    const payload = {
      bookId,
      userId,
      message,
      timestamp: new Date().toISOString(),
      source: 'chatapp',
      version: '2.0',
      // Métadonnées supplémentaires pour n8n
      metadata: {
        messageLength: message.length,
        wordCount: message.split(' ').length,
        requestId: `req_${Date.now()}`,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    console.log('📤 Payload envoyé à n8n:', JSON.stringify(payload, null, 2));

    // Headers avec authentification et métadonnées
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChatApp-Webhook/2.0',
      'X-Request-ID': payload.metadata.requestId,
      'X-Source': 'chatapp'
    };

    if (username && password) {
      const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = basicAuth;
      console.log('🔐 Authentification Basic Auth activée');
    }

    console.log('📋 Headers:', Object.keys(headers));

    // Appel webhook avec timeout et retry
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    let webhookResponse;
    let attempt = 1;
    const maxAttempts = 3;

    while (attempt <= maxAttempts) {
      try {
        console.log(`🚀 Tentative ${attempt}/${maxAttempts} - Appel n8n...`);
        
        webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        break; // Succès, sortir de la boucle
        
      } catch (fetchError: any) {
        console.error(`❌ Tentative ${attempt} échouée:`, fetchError.message);
        
        if (attempt === maxAttempts) {
          throw fetchError; // Dernière tentative, propager l'erreur
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        attempt++;
      }
    }

    if (!webhookResponse) {
      throw new Error('Aucune réponse après toutes les tentatives');
    }

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Temps de réponse: ${responseTime}ms`);
    console.log('📊 Statut réponse n8n:', webhookResponse.status);

    // Gestion des erreurs HTTP
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      const errorData = {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText,
        responseTime
      };
      
      addLog('ERROR', { type: 'HTTP_ERROR', ...errorData });
      console.error('❌ Erreur HTTP n8n:', errorData);
      
      return NextResponse.json({ 
        success: false, 
        message: 'Erreur webhook n8n',
        webhookError: `${webhookResponse.status}: ${errorText}`,
        debug: {
          responseTime,
          attempt: attempt - 1
        }
      }, { status: 500 });
    }

    // Traitement de la réponse
    let result;
    const contentType = webhookResponse.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        result = await webhookResponse.json();
      } else {
        const textResult = await webhookResponse.text();
        result = { rawResponse: textResult };
      }
    } catch (parseError) {
      console.warn('⚠️ Impossible de parser la réponse JSON, traitement comme texte');
      result = { rawResponse: await webhookResponse.text() };
    }

    addLog('RESPONSE', { 
      status: webhookResponse.status,
      result,
      responseTime,
      attempts: attempt - 1
    });

    console.log('✅ Réponse n8n réussie:', result);
    console.log(`📈 Performance: ${responseTime}ms en ${attempt - 1} tentative(s)`);

    // Vérifier si n8n a envoyé une réponse IA directe
    if (result && (result.response || result.aiResponse || result.message)) {
      const aiResponse = result.response || result.aiResponse || result.message;
      console.log('🤖 Réponse IA détectée dans la réponse n8n');
      
      // Sauvegarder immédiatement la réponse IA
      try {
        const supabase = createClient();
        const assistantMessage = {
          book_id: bookId,
          title: 'Réponse Assistant',
          content: aiResponse,
        };

        const { data: savedAI, error: aiError } = await supabase
          .from('book_chat')
          .insert(assistantMessage)
          .select()
          .single();

        if (aiError) {
          console.error('❌ Erreur sauvegarde réponse IA:', aiError);
        } else {
          console.log('✅ Réponse IA sauvegardée:', savedAI.id);
        }
      } catch (saveError) {
        console.error('❌ Erreur lors de la sauvegarde IA:', saveError);
      }
    }

    // Réponse de succès avec métadonnées
    return NextResponse.json({ 
      success: true, 
      data: result,
      debug: {
        responseTime,
        attempts: attempt - 1,
        timestamp: new Date().toISOString(),
        hasAIResponse: !!(result?.response || result?.aiResponse || result?.message)
      }
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    addLog('ERROR', {
      type: 'SYSTEM_ERROR',
      error: error.message,
      stack: error.stack,
      responseTime
    });

    console.error('=== ERREUR CRITIQUE WEBHOOK ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Temps écoulé:', responseTime, 'ms');
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message,
      debug: {
        responseTime,
        timestamp: new Date().toISOString(),
        type: error.name || 'UnknownError'
      }
    }, { status: 500 });
  }
}

// Route pour recevoir les réponses n8n (méthode PUT)
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    addLog('REQUEST', { 
      url: request.url,
      method: 'PUT',
      body,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    console.log('=== RÉPONSE N8N REÇUE ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const { bookId, response, timestamp, metadata } = body;

    if (!bookId || !response) {
      const error = { error: 'bookId et response requis', received: { bookId, response } };
      addLog('ERROR', error);
      return NextResponse.json(error, { status: 400 });
    }

    // Sauvegarder la réponse de l'IA avec métadonnées
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: response,
      created_at: timestamp || new Date().toISOString(),
      updated_at: timestamp || new Date().toISOString(),
    };

    const supabase = createClient();
    const { data: savedMessage, error: messageError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (messageError) {
      addLog('ERROR', { type: 'DATABASE_ERROR', error: messageError });
      console.error('❌ Erreur sauvegarde réponse IA:', messageError);
      return NextResponse.json({
        error: 'Erreur sauvegarde message',
        details: messageError.message
      }, { status: 500 });
    }

    const responseTime = Date.now() - startTime;
    
    addLog('RESPONSE', {
      messageId: savedMessage.id,
      bookId,
      responseLength: response.length,
      responseTime
    });

    console.log('✅ Réponse IA sauvegardée avec succès');
    console.log('📊 Message ID:', savedMessage.id);
    console.log(`⏱️ Temps de traitement: ${responseTime}ms`);

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse IA sauvegardée',
      data: {
        messageId: savedMessage.id,
        wordCount: response.split(' ').length,
        timestamp: savedMessage.created_at
      },
      debug: {
        responseTime,
        metadata
      }
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    addLog('ERROR', {
      type: 'PUT_ERROR',
      error: error.message,
      responseTime
    });

    console.error('❌ Erreur traitement réponse n8n:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error.message,
      debug: { responseTime }
    }, { status: 500 });
  }
}