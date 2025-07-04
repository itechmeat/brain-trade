import { NextRequest } from 'next/server';

import { createAPIHandlerWithParams } from '@/lib/api/base-handler';
import { APIError } from '@/lib/api/middleware/auth';
import { getChatSession, updateChatSession } from '@/lib/chat-utils';

/**
 * GET /api/chats/[id] - Get specific chat session
 */
export const GET = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;
  
  const session = getChatSession(sessionId);
  if (!session) {
    // Use APIError for proper 404 handling
    throw new APIError('Chat session not found', 404);
  }

  return session;
});

/**
 * PATCH /api/chats/[id] - Update specific chat session
 */
export const PATCH = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;
  const body = await request.json();
  
  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  const updateSuccess = updateChatSession(sessionId, body);
  if (!updateSuccess) {
    throw new Error('Failed to update chat session');
  }

  return getChatSession(sessionId);
});