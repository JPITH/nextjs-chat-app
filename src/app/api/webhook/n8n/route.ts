// src/app/api/webhook/n8n/route.ts - Version avec debug avancé
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Webhook n8n - Payload complet reçu:');
    console.log(JSON.stringify(body, null, 2));
    console.log('🔍 Headers reçus:', Object.fromEntries(request.headers.entries()));

    // n8n peut envoyer la réponse de différentes façons - chercher dans toutes les propriétés possibles
    const bookId = body.bookId || body.book_id || body.id;
    const aiResponse = body.response || body.message || body.aiResponse || body.content || body.reply || body.answer || body.text;
    const source = body.source || 'n8n';

    console.log('🔍 Données extraites du payload:');
    console.log('- bookId:', bookId);
    console.log('- aiResponse existe:', !!aiResponse);
    console.log('- aiResponse longueur:', aiResponse?.length || 0);
    console.log('- source:', source);
    console.log('- toutes les clés du payload:', Object.keys(body));

    if (!bookId) {
      console.error('❌ bookId manquant dans le payload');
      console.error('Clés disponibles:', Object.keys(body));
      return NextResponse.json({ 
        error: 'bookId requis',
        receivedKeys: Object.keys(body),
        hint: 'Vérifiez que n8n envoie bien le bookId dans le payload',
        debug: {
          bodyReceived: body,
          searchedFor: ['bookId', 'book_id', 'id']
        }
      }, { status: 400 });
    }

    if (!aiResponse) {
      console.error('❌ Réponse IA manquante dans le payload');
      console.error('Clés disponibles:', Object.keys(body));
      return NextResponse.json({ 
        error: 'Réponse IA manquante',
        receivedKeys: Object.keys(body),
        hint: 'n8n doit envoyer la réponse dans response, message, content, reply, answer ou text',
        debug: {
          bodyReceived: body,
          searchedFor: ['response', 'message', 'aiResponse', 'content', 'reply', 'answer', 'text']
        }
      }, { status: 400 });
    }

    // Utiliser le service client qui bypass RLS
    const supabase = createServiceClient();
    console.log('🔧 Utilisation du service client Supabase');
    
    // Vérifier si le livre existe
    console.log('🔍 Vérification existence du livre:', bookId);
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, user_id, title')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('❌ Livre non trouvé:', bookId);
      console.error('Erreur Supabase:', bookError);
      return NextResponse.json({ 
        error: 'Livre non trouvé',
        bookId,
        details: bookError?.message,
        debug: {
          searchedBookId: bookId,
          supabaseError: bookError
        }
      }, { status: 404 });
    }

    console.log('✅ Livre trouvé:', {
      id: book.id,
      title: book.title,
      user_id: book.user_id
    });

    // Préparer le message assistant
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: String(aiResponse).trim(),
    };

    console.log('💾 Préparation sauvegarde message assistant:');
    console.log('- book_id:', assistantMessage.book_id);
    console.log('- title:', assistantMessage.title);
    console.log('- content longueur:', assistantMessage.content.length);
    console.log('- content preview:', assistantMessage.content.substring(0, 100) + '...');

    // Sauvegarder la réponse de l'assistant avec service role
    console.log('💾 Tentative sauvegarde avec service role...');
    const { data: savedMessage, error: saveError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde avec service role:');
      console.error('Code:', saveError.code);
      console.error('Message:', saveError.message);
      console.error('Details:', saveError.details);
      console.error('Hint:', saveError.hint);
      
      return NextResponse.json({ 
        error: 'Erreur sauvegarde message assistant',
        details: saveError.message,
        errorCode: saveError.code,
        bookId,
        debug: {
          usingServiceRole: true,
          messageToSave: assistantMessage,
          supabaseError: saveError
        }
      }, { status: 500 });
    }

    console.log('✅ Message assistant sauvegardé avec succès:');
    console.log('- ID:', savedMessage.id);
    console.log('- Created at:', savedMessage.created_at);
    console.log('- Book ID:', savedMessage.book_id);
    console.log('- Title:', savedMessage.title);
    console.log('- Content longueur:', savedMessage.content.length);

    // Vérifier que le message est bien visible
    console.log('🔍 Vérification: récupération des messages du livre...');
    const { data: allMessages, error: listError } = await supabase
      .from('book_chat')
      .select('id, title, content, created_at')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('⚠️ Erreur vérification messages:', listError);
    } else {
      console.log('📋 Derniers messages du livre:');
      allMessages?.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.created_at}] ${msg.title}: ${msg.content.substring(0, 50)}...`);
      });
    }

    // Réponse de succès détaillée pour n8n
    const successResponse = {
      success: true,
      messageId: savedMessage.id,
      bookId: bookId,
      message: 'Réponse IA sauvegardée avec succès via service role',
      savedAt: savedMessage.created_at,
      contentLength: assistantMessage.content.length,
      bookTitle: book.title,
      totalMessagesInBook: allMessages?.length || 0,
      debug: {
        usingServiceRole: true,
        originalPayload: {
          hasBookId: !!body.bookId,
          hasResponse: !!body.response,
          allKeys: Object.keys(body)
        },
        savedMessage: {
          id: savedMessage.id,
          title: savedMessage.title,
          contentPreview: savedMessage.content.substring(0, 100)
        }
      }
    };

    console.log('📤 Envoi réponse succès à n8n:', {
      success: successResponse.success,
      messageId: successResponse.messageId,
      bookId: successResponse.bookId
    });

    return NextResponse.json(successResponse);

  } catch (error: any) {
    console.error('❌ Erreur webhook complète:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({
      error: 'Erreur serveur webhook',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      debug: {
        errorType: error.constructor.name,
        caught: 'webhook main catch block'
      }
    }, { status: 500 });
  }
}

// GET pour tester le webhook
export async function GET() {
  const testPayload = {
    bookId: 'test-book-id',
    response: 'Ceci est une réponse de test du webhook',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    status: 'Webhook n8n opérationnel',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Recevoir les réponses IA de n8n',
      GET: 'Test de santé du webhook'
    },
    expectedPayload: {
      bookId: 'string (requis) - ID du livre',
      response: 'string (réponse IA, requis)',
      message: 'string (alternative à response)',
      content: 'string (alternative à response)',
      timestamp: 'string (optionnel)'
    },
    testPayloadExample: testPayload,
    debug: {
      serviceRoleAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/n8n`
    }
  });
}