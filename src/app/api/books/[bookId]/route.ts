// src/app/api/books/[bookId]/route.ts - Version avec debugging
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = await createClient();
    const body = await request.json();
    const { message } = body;

    console.log('📝 Message reçu pour le livre:', bookId, 'Longueur:', message?.length);

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Sauvegarder le message utilisateur
    const userMessage = {
      book_id: bookId,
      title: 'Message utilisateur',
      content: message.trim(),
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('book_chat')
      .insert(userMessage)
      .select()
      .single();

    if (messageError) {
      console.error('❌ Erreur sauvegarde message:', messageError);
      return NextResponse.json({ error: 'Erreur sauvegarde message' }, { status: 500 });
    }

    console.log('✅ Message utilisateur sauvegardé:', savedMessage.id);

    // Appeler n8n en arrière-plan avec plus de debugging
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    console.log('🔗 URL Webhook:', webhookUrl ? 'Configurée' : 'NON CONFIGURÉE');

    if (webhookUrl) {
      console.log('📡 Envoi vers n8n...');
      
      const webhookPayload = {
        bookId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        userId: (await supabase.auth.getUser()).data?.user?.id,
        messageId: savedMessage.id
      };

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'ChatApp/1.0'
        },
        body: JSON.stringify(webhookPayload),
      })
      .then(response => {
        console.log('📡 Réponse n8n status:', response.status);
        return response.text();
      })
      .then(data => {
        console.log('📡 Réponse n8n:', data);
      })
      .catch(error => {
        console.error('❌ Erreur webhook n8n:', error);
      });
    } else {
      console.warn('⚠️ Aucun webhook n8n configuré');
    }

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('❌ Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// Garder les autres méthodes GET et DELETE inchangées...
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = await createClient();
    
    const { data: messages, error } = await supabase
      .from('book_chat')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur récupération messages:', error);
      return NextResponse.json({ error: 'Erreur récupération messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Supprimer d'abord tous les messages du livre
    const { error: chatError } = await supabase
      .from('book_chat')
      .delete()
      .eq('book_id', bookId);

    if (chatError) {
      console.error('Erreur suppression messages:', chatError);
    }

    // Puis supprimer le livre
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', user.id);

    if (bookError) {
      console.error('Erreur suppression livre:', bookError);
      return NextResponse.json({ error: 'Erreur suppression livre' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}