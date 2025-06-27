// src/app/api/webhook/n8n/route.ts - Webhook avec service role
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Webhook n8n body complet:', JSON.stringify(body, null, 2));
    console.log('🔍 Headers reçus:', Object.fromEntries(request.headers.entries()));

    // n8n peut envoyer la réponse de différentes façons - on essaie toutes les possibilités
    const bookId = body.bookId || body.book_id || body.id;
    const aiResponse = body.response || body.message || body.aiResponse || body.content || body.reply || body.answer;

    console.log('🔍 Données extraites:', { 
      bookId, 
      hasResponse: !!aiResponse,
      responseLength: aiResponse?.length || 0,
      allKeys: Object.keys(body)
    });

    if (!bookId) {
      console.error('❌ bookId manquant dans:', Object.keys(body));
      return NextResponse.json({ 
        error: 'bookId requis',
        receivedKeys: Object.keys(body),
        hint: 'Vérifiez que n8n envoie bien le bookId dans le payload'
      }, { status: 400 });
    }

    if (!aiResponse) {
      console.error('❌ Réponse IA manquante dans:', Object.keys(body));
      return NextResponse.json({ 
        error: 'Réponse IA manquante',
        receivedKeys: Object.keys(body),
        hint: 'n8n doit envoyer la réponse dans response, message, content, reply ou answer'
      }, { status: 400 });
    }

    // Utiliser le service client qui bypass RLS
    const supabase = createServiceClient();
    console.log('🔧 Utilisation du service client Supabase pour bypass RLS');
    
    // Vérifier si le livre existe
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, user_id')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('❌ Livre non trouvé:', bookId, 'Erreur:', bookError);
      return NextResponse.json({ 
        error: 'Livre non trouvé',
        bookId,
        details: bookError?.message
      }, { status: 404 });
    }

    console.log('✅ Livre trouvé:', book.id, 'User:', book.user_id);

    // Sauvegarder la réponse de l'assistant
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: String(aiResponse).trim(),
    };

    console.log('💾 Tentative de sauvegarde avec service role:', {
      book_id: assistantMessage.book_id,
      title: assistantMessage.title,
      content_length: assistantMessage.content.length,
      content_preview: assistantMessage.content.substring(0, 100)
    });

    const { data: savedMessage, error: saveError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde avec service role:', {
        error: saveError,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      });
      return NextResponse.json({ 
        error: 'Erreur sauvegarde',
        details: saveError.message,
        errorCode: saveError.code,
        bookId,
        usingServiceRole: true
      }, { status: 500 });
    }

    console.log('✅ Réponse assistant sauvegardée avec service role:', {
      id: savedMessage.id,
      created_at: savedMessage.created_at,
      book_id: savedMessage.book_id,
      title: savedMessage.title
    });

    // Réponse de succès pour n8n
    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      bookId: bookId,
      message: 'Réponse IA sauvegardée avec succès via service role',
      savedAt: savedMessage.created_at,
      contentLength: assistantMessage.content.length,
      usingServiceRole: true
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook complète:', error);
    
    // Log plus détaillé pour debug
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    return NextResponse.json({
      error: 'Erreur serveur webhook',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Webhook n8n body complet:', JSON.stringify(body, null, 2));
    console.log('🔍 Headers reçus:', Object.fromEntries(request.headers.entries()));

    // n8n peut envoyer la réponse de différentes façons - on essaie toutes les possibilités
    const bookId = body.bookId || body.book_id || body.id;
    const aiResponse = body.response || body.message || body.aiResponse || body.content || body.reply || body.answer;

    console.log('🔍 Données extraites:', { 
      bookId, 
      hasResponse: !!aiResponse,
      responseLength: aiResponse?.length || 0,
      allKeys: Object.keys(body)
    });

    if (!bookId) {
      console.error('❌ bookId manquant dans:', Object.keys(body));
      return NextResponse.json({ 
        error: 'bookId requis',
        receivedKeys: Object.keys(body),
        hint: 'Vérifiez que n8n envoie bien le bookId dans le payload'
      }, { status: 400 });
    }

    if (!aiResponse) {
      console.error('❌ Réponse IA manquante dans:', Object.keys(body));
      return NextResponse.json({ 
        error: 'Réponse IA manquante',
        receivedKeys: Object.keys(body),
        hint: 'n8n doit envoyer la réponse dans response, message, content, reply ou answer'
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Vérifier si le livre existe
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, user_id')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('❌ Livre non trouvé:', bookId, 'Erreur:', bookError);
      return NextResponse.json({ 
        error: 'Livre non trouvé',
        bookId,
        details: bookError?.message
      }, { status: 404 });
    }

    console.log('✅ Livre trouvé:', book.id, 'User:', book.user_id);

    // Sauvegarder la réponse de l'assistant
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: String(aiResponse).trim(),
    };

    console.log('💾 Tentative de sauvegarde:', {
      book_id: assistantMessage.book_id,
      title: assistantMessage.title,
      content_length: assistantMessage.content.length,
      content_preview: assistantMessage.content.substring(0, 100)
    });

    const { data: savedMessage, error: saveError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde détaillée:', {
        error: saveError,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      });
      return NextResponse.json({ 
        error: 'Erreur sauvegarde',
        details: saveError.message,
        errorCode: saveError.code,
        bookId
      }, { status: 500 });
    }

    console.log('✅ Réponse assistant sauvegardée:', {
      id: savedMessage.id,
      created_at: savedMessage.created_at,
      book_id: savedMessage.book_id,
      title: savedMessage.title
    });

    // Réponse de succès pour n8n
    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      bookId: bookId,
      message: 'Réponse IA sauvegardée avec succès',
      savedAt: savedMessage.created_at,
      contentLength: assistantMessage.content.length
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook complète:', error);
    
    // Log plus détaillé pour debug
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    return NextResponse.json({
      error: 'Erreur serveur webhook',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Ajouter une route GET pour tester le webhook
export async function GET() {
  return NextResponse.json({
    status: 'Webhook n8n opérationnel',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Recevoir les réponses IA de n8n',
      GET: 'Test de santé du webhook'
    },
    expectedPayload: {
      bookId: 'string (requis)',
      response: 'string (réponse IA, requis)',
      message: 'string (alternative à response)',
      content: 'string (alternative à response)',
      timestamp: 'string (optionnel)'
    }
  });
}