// src/app/api/chat/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { generateId } from '@/lib/utils';
import { Message, WebhookResponse } from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    const body: WebhookResponse = await request.json();
    const { sessionId, response, timestamp } = body;

    if (!sessionId || !response) {
      return NextResponse.json(
        { error: 'sessionId et response requis' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await redis.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Save assistant message
    const assistantMessage: Message = {
      id: generateId(),
      content: response,
      sender: 'assistant',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      sessionId,
    };

    await redis.saveMessage(assistantMessage);

    return NextResponse.json({ 
      success: true, 
      message: assistantMessage 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}