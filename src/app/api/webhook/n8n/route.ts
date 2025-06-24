// 1. Correction de src/app/api/webhook/n8n/route.ts - Version moderne avec @supabase/ssr
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Interface pour les logs de debug
interface WebhookLog {
  timestamp: string;
  type: 'REQUEST' | 'RESPONSE' | 'ERROR' | 'DEBUG' | 'N8N_CALL' | 'N8N_RESPONSE';
  data: any;
  requestId?: string;
}

// Stockage temporaire des logs
const webhookLogs: WebhookLog[] = [];

function addLog(type: WebhookLog['type'], data: any, requestId?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    data,
    requestId
  };
  
  webhookLogs.push(logEntry);
  
  if (webhookLogs.length > 200) {
    webhookLogs.shift();
  }
  
  console.log(`[${type}] ${logEntry.timestamp}${requestId ? ` [${requestId}]` : ''}:`, data);
}

// **FONCTION MODERNE : Client Supabase authentifié avec @supabase/ssr**
async function createAuthenticatedSupabaseClient() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    return supabase
  } catch (error) {
    console.error('Erreur création client Supabase authentifié:', error)
    throw error
  }
}

// Fonction pour formater les logs en chat
function formatLogsForChat(logs: WebhookLog[], requestId?: string): string {
  const filteredLogs = requestId 
    ? logs.filter(log => log.requestId === requestId)
    : logs.slice(-20);

  let chatMessage = `🔧 **LOGS WEBHOOK N8N** - ${new Date().toLocaleString()}\n\n`;
  
  filteredLogs.forEach((log, index) => {
    const emoji = {
      'REQUEST': '📤',
      'RESPONSE': '📥', 
      'ERROR': '❌',
      'DEBUG': '🔍',
      'N8N_CALL': '🚀',
      'N8N_RESPONSE': '🤖'
    }[log.type] || '📝';
    
    chatMessage += `${emoji} **${log.type}** - ${new Date(log.timestamp).toLocaleTimeString()}\n`;
    
    if (log.requestId) {
      chatMessage += `🆔 Request: ${log.requestId}\n`;
    }
    
    if (log.type === 'REQUEST') {
      chatMessage += `📋 Message: "${log.data.body?.message || 'N/A'}"\n`;
      chatMessage += `📚 Book ID: ${log.data.body?.bookId || 'N/A'}\n`;
    } else if (log.type === 'N8N_RESPONSE') {
      chatMessage += `📊 Status: ${log.data.status}\n`;
      chatMessage += `⏱️ Temps: ${log.data.fetchTime}\n`;
      if (log.data.result?.response) {
        chatMessage += `🤖 Réponse IA: "${log.data.result.response.substring(0, 100)}..."\n`;
      }
    } else if (log.type === 'ERROR') {
      chatMessage += `💥 Erreur: ${log.data.error || log.data.message}\n`;
    } else if (log.type === 'DEBUG') {
      chatMessage += `🔍 Info: ${log.data.message}\n`;
    }
    
    chatMessage += '\n';
  });
  
  chatMessage += `📊 **RÉSUMÉ**\n`;
  chatMessage += `- Total requêtes: ${logs.filter(l => l.type === 'REQUEST').length}\n`;
  chatMessage += `- Réponses n8n: ${logs.filter(l => l.type === 'N8N_RESPONSE').length}\n`;
  chatMessage += `- Erreurs: ${logs.filter(l => l.type === 'ERROR').length}\n`;
  
  return chatMessage;
}

// Route GET améliorée
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug');
  const requestId = url.searchParams.get('requestId');
  const format = url.searchParams.get('format');
  
  if (debug === 'logs') {
    const responseData = {
      logs: webhookLogs,
      total: webhookLogs.length,
      lastUpdate: webhookLogs[webhookLogs.length - 1]?.timestamp || 'Never',
      summary: {
        requests: webhookLogs.filter(l => l.type === 'REQUEST').length,
        responses: webhookLogs.filter(l => l.type === 'RESPONSE').length,
        errors: webhookLogs.filter(l => l.type === 'ERROR').length,
        debugs: webhookLogs.filter(l => l.type === 'DEBUG').length,
        n8nCalls: webhookLogs.filter(l => l.type === 'N8N_CALL').length,
        n8nResponses: webhookLogs.filter(l => l.type === 'N8N_RESPONSE').length
      }
    };

    if (format === 'json') {
      const filename = `webhook-logs-${new Date().toISOString().slice(0, 10)}.json`;
      return new NextResponse(JSON.stringify(responseData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }
    
    if (format === 'txt') {
      const filename = `webhook-logs-${new Date().toISOString().slice(0, 10)}.txt`;
      const textLogs = webhookLogs.map(log => 
        `[${log.type}] ${log.timestamp}${log.requestId ? ` [${log.requestId}]` : ''}\n${JSON.stringify(log.data, null, 2)}\n---\n`
      ).join('\n');
      
      return new NextResponse(textLogs, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }
    
    if (format === 'chat') {
      const chatMessage = formatLogsForChat(webhookLogs, requestId || undefined);
      return NextResponse.json({ 
        chatMessage,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(responseData);
  }
  
  if (debug === 'clear') {
    const count = webhookLogs.length;
    webhookLogs.length = 0;
    addLog('DEBUG', { message: `Logs nettoyés (${count} entrées supprimées)` });
    return NextResponse.json({ 
      success: true, 
      message: `${count} logs supprimés` 
    });
  }
  
  if (debug === 'test') {
    const testId = `test_${Date.now()}`;
    
    // **TEST AUTHENTIFICATION MODERNE**
    try {
      const supabase = await createAuthenticatedSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      addLog('DEBUG', { 
        message: 'Test API webhook avec auth Supabase moderne', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? 'Configuré' : 'NON CONFIGURÉ',
        supabaseAuth: authError ? `ERREUR: ${authError.message}` : 'OK',
        userId: authData?.user?.id || 'Non connecté',
        userEmail: authData?.user?.email || 'N/A'
      }, testId);
      
      // **TEST ÉCRITURE EN BASE**
      if (authData?.user) {
        try {
          const testMessage = {
            book_id: 'test-book-id',
            title: 'Test Debug',
            content: `Test d'authentification ${new Date().toISOString()}`,
          };

          const { data: insertData, error: insertError } = await supabase
            .from('book_chat')
            .insert(testMessage)
            .select()
            .single();

          if (insertError) {
            addLog('ERROR', {
              message: 'Test insertion échoué',
              error: insertError.message,
              code: insertError.code
            }, testId);
          } else {
            addLog('DEBUG', {
              message: 'Test insertion réussi',
              insertedId: insertData.id
            }, testId);
            
            // Nettoyer le test
            await supabase
              .from('book_chat')
              .delete()
              .eq('id', insertData.id);
          }
        } catch (insertError: any) {
          addLog('ERROR', {
            message: 'Exception test insertion',
            error: insertError.message
          }, testId);
        }
      }
      
      return NextResponse.json({ 
        status: 'API Test OK', 
        testId,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        supabaseAuth: authError ? `ERREUR: ${authError.message}` : 'OK',
        userId: authData?.user?.id || 'Non connecté',
        userEmail: authData?.user?.email || 'N/A',
        canInsert: authData?.user ? 'Test effectué' : 'Non testé (pas connecté)',
        totalLogs: webhookLogs.length
      });
    } catch (error: any) {
      addLog('ERROR', {
        message: 'Erreur test authentification',
        error: error.message,
        stack: error.stack
      }, testId);
      
      return NextResponse.json({
        status: 'Test Error',
        error: error.message,
        testId,
        totalLogs: webhookLogs.length
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({ 
    status: 'Webhook n8n actif - Version SSR Auth',
    endpoints: {
      send: 'POST /api/webhook/n8n',
      receive: 'PUT /api/webhook/n8n',
      logs: 'GET /api/webhook/n8n?debug=logs',
      exportJson: 'GET /api/webhook/n8n?debug=logs&format=json',
      exportTxt: 'GET /api/webhook/n8n?debug=logs&format=txt',
      exportChat: 'GET /api/webhook/n8n?debug=logs&format=chat',
      test: 'GET /api/webhook/n8n?debug=test',
      clear: 'GET /api/webhook/n8n?debug=clear'
    },
    totalLogs: webhookLogs.length,
    lastActivity: webhookLogs[webhookLogs.length - 1]?.timestamp || 'Never'
  });
}

// Route POST avec authentification SSR
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    addLog('DEBUG', { 
      message: 'POST Request démarré',
      startTime,
      url: request.url,
      method: request.method
    }, requestId);

    const body = await request.json();
    
    addLog('REQUEST', { 
      url: request.url,
      method: 'POST',
      body,
      headers: Object.fromEntries(request.headers.entries()),
      contentLength: JSON.stringify(body).length
    }, requestId);
    
    const { bookId, message, userId } = body;

    // Validation
    if (!bookId || !message || !userId) {
      const error = { error: 'Paramètres manquants', received: { bookId, message, userId } };
      addLog('ERROR', error, requestId);
      return NextResponse.json(error, { status: 400 });
    }

    // **VÉRIFICATION AUTHENTIFICATION**
    try {
      const supabase = await createAuthenticatedSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        const error = { 
          error: 'Non authentifié', 
          details: authError?.message || 'Utilisateur non connecté',
          needsAuth: true
        };
        addLog('ERROR', error, requestId);
        return NextResponse.json(error, { status: 401 });
      }
      
      addLog('DEBUG', {
        message: 'Utilisateur authentifié',
        userId: authData.user.id,
        email: authData.user.email
      }, requestId);
      
    } catch (authCheckError: any) {
      const error = { 
        error: 'Erreur vérification authentification', 
        details: authCheckError.message 
      };
      addLog('ERROR', error, requestId);
      return NextResponse.json(error, { status: 500 });
    }

    // Configuration n8n
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USER || process.env.N8N_WEBHOOK_USER;
    const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || process.env.N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl) {
      const error = { error: 'NEXT_PUBLIC_N8N_WEBHOOK_URL non configuré' };
      addLog('ERROR', error, requestId);
      return NextResponse.json(error, { status: 500 });
    }

    // Payload pour n8n
    const payload = {
      bookId,
      userId,
      message,
      timestamp: new Date().toISOString(),
      source: 'chatapp',
      version: '2.4-ssr-auth',
      requestId,
      metadata: {
        messageLength: message.length,
        wordCount: message.split(' ').length,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    // Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChatApp-Webhook/2.4-ssr-auth',
      'X-Request-ID': requestId,
      'X-Source': 'chatapp'
    };

    if (username && password) {
      const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = basicAuth;
    }

    addLog('N8N_CALL', {
      url: webhookUrl,
      payload,
      headers: Object.keys(headers)
    }, requestId);

    // Appel webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let webhookResponse;
    const fetchStart = Date.now();
    
    try {
      webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const fetchTime = Date.now() - fetchStart;
      clearTimeout(timeoutId);
      
      addLog('N8N_RESPONSE', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        fetchTime: `${fetchTime}ms`,
        headers: Object.fromEntries(webhookResponse.headers.entries())
      }, requestId);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      addLog('ERROR', {
        error: 'Erreur fetch n8n',
        message: fetchError.message,
        name: fetchError.name
      }, requestId);
      throw fetchError;
    }

    const responseTime = Date.now() - startTime;

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      const errorData = {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText,
        responseTime
      };
      
      addLog('ERROR', { type: 'HTTP_ERROR', ...errorData }, requestId);
      
      return NextResponse.json({ 
        success: false, 
        message: 'Erreur webhook n8n',
        webhookError: `${webhookResponse.status}: ${errorText}`,
        requestId,
        debug: { responseTime }
      }, { status: 500 });
    }

    // Traitement de la réponse
    const responseText = await webhookResponse.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
      addLog('DEBUG', { 
        message: 'JSON parsé avec succès', 
        resultKeys: Object.keys(result),
        responseLength: responseText.length 
      }, requestId);
    } catch (parseError: any) {
      result = { rawResponse: responseText };
      addLog('ERROR', {
        error: 'Erreur parsing JSON',
        parseError: parseError.message,
        responseText: responseText.substring(0, 500)
      }, requestId);
    }

    // Chercher la réponse IA
    const possibleResponseFields = ['response', 'aiResponse', 'message', 'output', 'result', 'text'];
    let aiResponse = null;
    
    for (const field of possibleResponseFields) {
      if (result && result[field] && typeof result[field] === 'string' && result[field].trim()) {
        aiResponse = result[field].trim();
        addLog('DEBUG', { 
          message: `Réponse IA trouvée dans le champ: ${field}`,
          responseLength: aiResponse.length
        }, requestId);
        break;
      }
    }
    
    // **SAUVEGARDE AVEC CLIENT SSR AUTHENTIFIÉ**
    let aiResponseSaved = false;
    let savedAIResponse = null;
    
    if (aiResponse) {
      try {
        const supabase = await createAuthenticatedSupabaseClient();
        
        addLog('DEBUG', {
          message: 'Tentative sauvegarde avec client SSR authentifié',
          responseLength: aiResponse.length
        }, requestId);
        
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
          addLog('ERROR', { 
            error: 'Erreur sauvegarde Supabase',
            supabaseError: aiError,
            message: aiError.message,
            code: aiError.code,
            details: aiError.details
          }, requestId);
        } else {
          addLog('DEBUG', { 
            message: 'Réponse IA sauvegardée avec succès',
            savedMessageId: savedAI.id,
            timestamp: savedAI.created_at
          }, requestId);
          
          aiResponseSaved = true;
          savedAIResponse = {
            id: savedAI.id,
            content: aiResponse,
            timestamp: savedAI.created_at
          };
        }
      } catch (saveError: any) {
        addLog('ERROR', {
          error: 'Exception lors sauvegarde IA',
          saveError: saveError.message,
          stack: saveError.stack
        }, requestId);
      }
    }

    const finalResponse = { 
      success: true, 
      data: result,
      aiResponseSaved,
      savedAIResponse,
      requestId,
      debug: {
        responseTime,
        timestamp: new Date().toISOString(),
        hasAIResponse: !!aiResponse,
        aiResponseLength: aiResponse?.length || 0,
        n8nStatus: webhookResponse.status,
        logsAvailable: `/api/webhook/n8n?debug=logs&requestId=${requestId}`
      }
    };

    addLog('RESPONSE', { 
      success: true,
      aiResponseSaved,
      responseTime,
      finalResponse
    }, requestId);

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    addLog('ERROR', {
      type: 'SYSTEM_ERROR',
      error: error.message,
      stack: error.stack,
      responseTime
    }, requestId);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message,
      requestId,
      debug: { responseTime }
    }, { status: 500 });
  }
}

// Route PUT avec authentification SSR
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `put_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    addLog('REQUEST', { 
      url: request.url,
      method: 'PUT',
      body,
      headers: Object.fromEntries(request.headers.entries())
    }, requestId);
    
    const { bookId, response, timestamp, metadata } = body;

    if (!bookId || !response) {
      const error = { error: 'bookId et response requis', received: { bookId, response } };
      addLog('ERROR', error, requestId);
      return NextResponse.json(error, { status: 400 });
    }

    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: response,
      created_at: timestamp || new Date().toISOString(),
      updated_at: timestamp || new Date().toISOString(),
    };

    // **UTILISER LE CLIENT SSR AUTHENTIFIÉ**
    const supabase = await createAuthenticatedSupabaseClient();
    const { data: savedMessage, error: messageError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (messageError) {
      addLog('ERROR', { 
        type: 'DATABASE_ERROR', 
        error: messageError,
        message: messageError.message,
        code: messageError.code 
      }, requestId);
      return NextResponse.json({
        error: 'Erreur sauvegarde message',
        details: messageError.message,
        requestId
      }, { status: 500 });
    }

    const responseTime = Date.now() - startTime;
    
    addLog('RESPONSE', {
      messageId: savedMessage.id,
      bookId,
      responseLength: response.length,
      responseTime
    }, requestId);

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse IA sauvegardée',
      data: {
        messageId: savedMessage.id,
        wordCount: response.split(' ').length,
        timestamp: savedMessage.created_at
      },
      requestId,
      debug: { responseTime, metadata }
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    addLog('ERROR', {
      type: 'PUT_ERROR',
      error: error.message,
      responseTime
    }, requestId);

    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error.message,
      requestId,
      debug: { responseTime }
    }, { status: 500 });
  }
}