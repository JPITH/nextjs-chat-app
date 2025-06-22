// src/app/api/sse/[sessionId]/route.ts
import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { sessionId } = params;
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify session belongs to user
  const session = await redis.getChatSession(sessionId);
  if (!session || session.userId !== userId) {
    return new Response('Session not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastMessageCount = session.messageCount;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Poll for new messages every 2 seconds
      const interval = setInterval(async () => {
        try {
          const currentSession = await redis.getChatSession(sessionId);
          if (currentSession && currentSession.messageCount > lastMessageCount) {
            const messages = await redis.getSessionMessages(sessionId);
            const newMessages = messages.slice(lastMessageCount);
            
            for (const message of newMessages) {
              const data = JSON.stringify({
                type: 'message',
                message: {
                  id: message.id,
                  content: message.content,
                  sender: message.sender,
                  timestamp: message.timestamp.toISOString(),
                  sessionId: message.sessionId,
                },
              });
              
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            
            lastMessageCount = currentSession.messageCount;
          }
        } catch (error) {
          console.error('SSE polling error:', error);
        }
      }, 2000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}