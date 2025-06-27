// src/app/api/webhook/n8n/route.ts - Version avec nettoyage JSON automatique
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/webhook';

// Fonction pour nettoyer et valider le JSON
function cleanAndParseJSON(data: any): any {
  try {
    // Si c'est déjà un objet, le retourner
    if (typeof data === 'object' && data !== null) {
      // Nettoyer les chaînes dans l'objet
      const cleaned = { ...data };
      if (typeof cleaned.response === 'string') {
        cleaned.response = cleaned.response
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim();
      }
      return cleaned;
    }
    
    // Si c'est une chaîne, essayer de la parser
    if (typeof data === 'string') {
      // Nettoyer d'abord la chaîne JSON
      const cleanedString = data
        .replace(/\r\n/g, '\\n')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\n')
        .replace(/\t/g, '\\t');
      
      return JSON.parse(cleanedString);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erreur parsing JSON:', error);
    console.error('Données reçues:', data);
    
    // Fallback: extraire manuellement les données
    if (typeof data === 'string') {
      // Recherche pattern pour extraire bookId et response
      const bookIdMatch = data.match(/"bookId":\s*"([^"]+)"/);
      const responseMatch = data.match(/"response":\s*"((?:[^"\\]|\\.)*)"/);
      const timestampMatch = data.match(/"timestamp":\s*"([^"]+)"/);
      
      if (bookIdMatch && responseMatch) {
        return {
          bookId: bookIdMatch[1],
          response: responseMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
          timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString()
        };
      }
    }
    
    throw new Error('Impossible de parser les données JSON');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lire le body brut
    const rawBody = await request.text();
    console.log('📥 Webhook n8n - Body brut reçu:');
    console.log(rawBody.substring(0, 500) + (rawBody.length > 500 ? '...' : ''));

    // Nettoyer et parser le JSON
    let body;
    try {
      body = cleanAndParseJSON(rawBody);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return NextResponse.json({ 
        error: 'JSON invalide',
        details: parseError instanceof Error ? parseError.message : 'Erreur de parsing',
        receivedData: rawBody.substring(0, 200),
        hint: 'Vérifiez que n8n envoie un JSON valide sans sauts de ligne non échappés'
      }, { status: 400 });
    }

    console.log('🔍 Données nettoyées extraites:');
    console.log('- bookId:', body.bookId);
    console.log('- response existe:', !!body.response);
    console.log('- response longueur:', body.response?.length || 0);

    // Chercher dans toutes les propriétés possibles
    const bookId = body.bookId || body.book_id || body.id;
    const aiResponse = body.response || body.message || body.aiResponse || body.content || body.reply || body.answer || body.text;
    const source = body.source || 'n8n';

    if (!bookId) {
      console.error('❌ bookId manquant dans le payload');
      return NextResponse.json({ 
        error: 'bookId requis',
        receivedKeys: Object.keys(body),
        hint: 'Vérifiez que n8n envoie bien le bookId dans le payload'
      }, { status: 400 });
    }

    if (!aiResponse) {
      console.error('❌ Réponse IA manquante dans le payload');
      return NextResponse.json({ 
        error: 'Réponse IA manquante',
        receivedKeys: Object.keys(body),
        hint: 'n8n doit envoyer la réponse dans response, message, content, reply, answer ou text'
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
      return NextResponse.json({ 
        error: 'Livre non trouvé',
        bookId,
        details: bookError?.message
      }, { status: 404 });
    }

    console.log('✅ Livre trouvé:', book.title);

    // Nettoyer la réponse IA (enlever échappements excessifs)
    const cleanedAIResponse = String(aiResponse)
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();

    // Préparer le message assistant
    const assistantMessage = {
      book_id: bookId,
      title: 'Réponse Assistant',
      content: cleanedAIResponse,
    };

    console.log('💾 Sauvegarde message assistant:');
    console.log('- content longueur:', assistantMessage.content.length);
    console.log('- content preview:', assistantMessage.content.substring(0, 100) + '...');

    // Sauvegarder la réponse de l'assistant
    const { data: savedMessage, error: saveError } = await supabase
      .from('book_chat')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde:', saveError);
      return NextResponse.json({ 
        error: 'Erreur sauvegarde message assistant',
        details: saveError.message,
        bookId
      }, { status: 500 });
    }

    console.log('✅ Message assistant sauvegardé:', savedMessage.id);

    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      bookId: bookId,
      message: 'Réponse IA sauvegardée avec succès',
      contentLength: cleanedAIResponse.length,
      source: source
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook complète:', error);
    return NextResponse.json({
      error: 'Erreur serveur webhook',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET pour tester le webhook
export async function GET() {
  return NextResponse.json({
    status: 'Webhook n8n opérationnel avec nettoyage JSON',
    timestamp: new Date().toISOString(),
    features: [
      'Nettoyage automatique des sauts de ligne',
      'Parsing JSON robuste',
      'Fallback manuel en cas d'erreur',
      'Support multiple formats de réponse'
    ],
    expectedPayload: {
      bookId: 'string (requis)',
      response: 'string (réponse IA, peut contenir des sauts de ligne)',
      timestamp: 'string (optionnel)'
    }
  });
}