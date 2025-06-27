// src/app/api/test-supabase/route.ts - Test de connectivité Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, testMessage } = body;
    
    console.log('🧪 Test Supabase avec:', { bookId, testMessage });
    
    const supabase = await createClient();
    
    // 1. Test de connexion basique
    console.log('🔌 Test connexion Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('book_chat')
      .select('count(*)')
      .limit(1);
      
    if (connectionError) {
      console.error('❌ Erreur connexion:', connectionError);
      return NextResponse.json({ 
        error: 'Connexion Supabase échouée',
        details: connectionError 
      }, { status: 500 });
    }
    
    console.log('✅ Connexion Supabase OK');
    
    // 2. Test de vérification du livre
    console.log('📚 Vérification du livre...');
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
      
    if (bookError) {
      console.error('❌ Livre non trouvé:', bookError);
      return NextResponse.json({ 
        error: 'Livre non trouvé',
        bookId,
        details: bookError 
      }, { status: 404 });
    }
    
    console.log('✅ Livre trouvé:', book.title);
    
    // 3. Test d'insertion d'un message
    console.log('💾 Test insertion message...');
    const testMessageData = {
      book_id: bookId,
      title: 'Test Message',
      content: testMessage || `Test d'insertion ${new Date().toISOString()}`,
    };
    
    console.log('📝 Données à insérer:', testMessageData);
    
    const { data: insertedMessage, error: insertError } = await supabase
      .from('book_chat')
      .insert(testMessageData)
      .select('*')
      .single();
      
    if (insertError) {
      console.error('❌ Erreur insertion:', {
        error: insertError,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return NextResponse.json({ 
        error: 'Insertion échouée',
        details: insertError,
        testData: testMessageData
      }, { status: 500 });
    }
    
    console.log('✅ Message inséré:', insertedMessage);
    
    // 4. Vérification que le message est bien en base
    console.log('🔍 Vérification lecture...');
    const { data: readBack, error: readError } = await supabase
      .from('book_chat')
      .select('*')
      .eq('id', insertedMessage.id)
      .single();
      
    if (readError) {
      console.error('❌ Erreur lecture:', readError);
    } else {
      console.log('✅ Message relu:', readBack);
    }
    
    // 5. Test de lecture de tous les messages du livre
    console.log('📋 Test lecture tous messages...');
    const { data: allMessages, error: allError } = await supabase
      .from('book_chat')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });
      
    if (allError) {
      console.error('❌ Erreur lecture tous messages:', allError);
    } else {
      console.log(`✅ ${allMessages.length} messages trouvés pour ce livre`);
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: '✅ OK',
        bookFound: '✅ OK',
        insertion: '✅ OK',
        readBack: readError ? '❌ ERREUR' : '✅ OK',
        allMessages: allError ? '❌ ERREUR' : `✅ ${allMessages?.length || 0} messages`
      },
      insertedMessage: insertedMessage,
      allMessagesCount: allMessages?.length || 0,
      bookTitle: book.title
    });
    
  } catch (error: any) {
    console.error('❌ Erreur globale test Supabase:', error);
    return NextResponse.json({
      error: 'Erreur test Supabase',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Endpoint de test Supabase',
    usage: {
      method: 'POST',
      payload: {
        bookId: 'string (requis)',
        testMessage: 'string (optionnel)'
      }
    },
    description: 'Teste la connectivité et les opérations Supabase'
  });
}