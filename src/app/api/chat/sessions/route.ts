// src/app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { generateId } from '@/lib/utils';
import { ChatSession } from '@/types/chat';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const sessions = await redis.getUserSessions(userId);
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title } = body;

    const sessionId = generateId();
    const now = new Date();

    const session: ChatSession = {
      id: sessionId,
      userId,
      title: title || 'Nouvelle conversation',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    await redis.createChatSession(session);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}