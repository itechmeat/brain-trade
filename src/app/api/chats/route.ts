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
  const validatedData = ValidationSchemas.chat.create.parse(body);
  const { originalIdea, experts, language } = validatedData;

  const newSession = createChatSession(originalIdea, experts, language);

  return newSession;
});
