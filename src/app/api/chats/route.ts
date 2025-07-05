import { NextRequest } from 'next/server';

import { createAPIHandler } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import { getAllSessions, createChatSession } from '@/lib/chat-utils';

/**
 * GET /api/chats - Get all chat sessions
 */
export const GET = createAPIHandler(async () => {
  const sessions = getAllSessions();

  return {
    sessions,
    count: sessions.length,
  };
});

/**
 * POST /api/chats - Create new chat session
 */
export const POST = createAPIHandler(async (request: NextRequest) => {
  const body = await request.json();
  
  // Check if this is a tokenized chat request
  const isTokenizedChat = body.isTokenized === true;
  const validatedData = isTokenizedChat 
    ? ValidationSchemas.chat.tokenized.parse(body)
    : ValidationSchemas.chat.create.parse(body);
    
  const { originalIdea, expertId, language, id } = validatedData;

  const newSession = createChatSession(originalIdea, expertId, language, id);

  return newSession;
});
