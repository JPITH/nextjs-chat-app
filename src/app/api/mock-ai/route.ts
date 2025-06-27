// src/app/api/mock-ai/route.ts - Simulation d'IA pour tester sans n8n
import { NextRequest, NextResponse } from 'next/server';

const AI_RESPONSES = [
  "Excellente idée ! Pour développer ce concept, pouvez-vous me parler du personnage principal ? Quel est son background et ses motivations ?",
  "C'est un début prometteur ! Je suggère d'ajouter plus de détails sensoriels. Qu'est-ce que votre personnage voit, entend, ressent dans cette scène ?",
  "Très bien ! Pour enrichir cette partie, pensez au conflit. Quel obstacle votre héros va-t-il rencontrer ? Comment cela va-t-il changer sa situation ?",
  "Parfait ! Maintenant, développons l'univers. À quelle époque se déroule votre histoire ? Dans quel lieu ? Comment ce contexte influence-t-il l'intrigue ?",
  "Bonne progression ! Pour le prochain chapitre, je recommande de créer une tension dramatique. Que pourrait-il arriver pour surprendre le lecteur ?",
  "Magnifique travail ! Votre style s'améliore. Avez-vous pensé à la fin de votre livre ? Comment voulez-vous que cette histoire se termine ?",
  "Continuez comme ça ! Pour enrichir votre récit, ajoutez quelques dialogues. Qu'est-ce que vos personnages se diraient dans cette situation ?",
  "Très créatif ! Maintenant, pensons à la structure. Combien de chapitres prévoyez-vous ? Quelle sera l'évolution de votre intrigue ?",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, message } = body;
    
    console.log('🤖 Mock IA reçu:', { bookId, message: message?.substring(0, 50) });
    
    if (!bookId || !message) {
      return NextResponse.json({ 
        error: 'bookId et message requis' 
      }, { status: 400 });
    }
    
    // Simuler un délai d'IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Choisir une réponse aléatoire
    const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    
    // Personnaliser la réponse selon le message
    let aiResponse = randomResponse;
    
    if (message.toLowerCase().includes('bonjour') || message.toLowerCase().includes('salut')) {
      aiResponse = "Bonjour ! Je suis votre assistant d'écriture. Je suis là pour vous aider à développer votre livre. Sur quoi travaillons-nous aujourd'hui ?";
    } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('aide')) {
      aiResponse = "Je peux vous aider de plusieurs façons : développer vos personnages, enrichir vos descriptions, structurer votre intrigue, ou améliorer votre style. Que souhaitez-vous travailler ?";
    } else if (message.length < 10) {
      aiResponse = "J'aimerais en savoir plus ! Pouvez-vous développer votre idée ? Plus vous me donnez de détails, mieux je peux vous aider.";
    }
    
    console.log('🤖 Réponse IA générée:', aiResponse.substring(0, 50));
    
    // Envoyer la réponse à notre webhook
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/n8n`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        source: 'mock-ai'
      })
    });
    
    const webhookResult = await webhookResponse.json();
    console.log('📤 Réponse webhook:', webhookResult);
    
    return NextResponse.json({
      success: true,
      message: 'Réponse IA simulée envoyée',
      aiResponse: aiResponse.substring(0, 50) + '...',
      webhookStatus: webhookResponse.status
    });
    
  } catch (error) {
    console.error('❌ Erreur Mock IA:', error);
    return NextResponse.json({ 
      error: 'Erreur simulation IA',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Mock IA opérationnel',
    description: 'Endpoint de simulation d\'IA pour tester sans n8n',
    usage: {
      method: 'POST',
      payload: {
        bookId: 'string',
        message: 'string'
      }
    },
    responses: `${AI_RESPONSES.length} réponses prédéfinies disponibles`
  });
}