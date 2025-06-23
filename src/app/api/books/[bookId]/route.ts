// src/app/api/chat/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { generateId } from '@/lib/utils';
import { Message } from '@/types/chat';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { sessionId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Verify session belongs to user
    const session = await redis.getChatSession(sessionId);
    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    const messages = await redis.getSessionMessages(sessionId);
    
    return NextResponse.json({ messages, session });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { sessionId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await redis.getChatSession(sessionId);
    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Save user message
    const userMessage: Message = {
      id: generateId(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      sessionId,
    };

    await redis.saveMessage(userMessage);

    // Send to n8n webhook
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (webhookUrl) {
        const webhookPayload = {
          sessionId,
          message,
          userId,
          timestamp: new Date().toISOString(),
        };

        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        }).catch(error => {
          console.error('Webhook error:', error);
        });
      }
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: userMessage 
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}