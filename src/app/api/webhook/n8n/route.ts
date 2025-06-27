// src/app/api/webhook/n8n/route.ts - Webhook corrigé
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Webhook n8n body complet:', JSON.stringify(body, null, 2));

    // n8n peut envoyer la réponse de différentes façons
    const bookId = body.bookId;
    const aiResponse = body.response || body.message || body.aiResponse || body.content;

    console.log('🔍 Données extraites:', { bookId, hasResponse: !!aiResponse });

    if (!bookId) {
      console.error('❌ bookId manquant');
      return NextResponse.json({ error: 'bookId requis' }, { status: 400 });
    }

    if (!aiResponse) {
      console.error('❌ Réponse IA manquante dans:', Object.keys(body));
      return NextResponse.json({ error: 'Réponse IA manquante' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Vérifier si le livre existe
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('❌ Livre non trouvé:', bookId);
      return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    }

    // Sauvegarder la réponse de l'assistant
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: aiResponse.toString(),
    };

    console.log('💾 Sauvegarde réponse assistant:', assistantMessage.content.substring(0, 100) + '...');

    const { data: savedMessage, error: saveError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde:', saveError);
      return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 });
    }

    console.log('✅ Réponse assistant sauvegardée avec ID:', savedMessage.id);

    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      message: 'Réponse IA sauvegardée avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 });
  }
}