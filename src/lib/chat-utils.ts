import { nanoid } from 'nanoid';
import { ChatSession } from '@/types/chat';

// Store for chat sessions (in production this will be database)
const chatSessions: Map<string, ChatSession> = new Map();

/**
 * Gets all chat sessions
 * @returns Array of chat sessions
 */
export function getAllSessions() {
  return Array.from(chatSessions.values());
}

/**
 * Creates a new chat session
 * @param originalIdea - The business idea to analyze
 * @param experts - Array of expert slugs
 * @param language - Detected language for consistent responses
 * @returns Created chat session
 */
export function createChatSession(
  originalIdea: string,
  experts: string[],
  language?: string,
): ChatSession {
  const sessionId = nanoid(12);
  const now = new Date();

  const newSession: ChatSession = {
    id: sessionId,
    title: `Chat Session - ${now.toLocaleDateString()}`,
    originalIdea,
    experts,
    messages: [],
    createdAt: now,
    updatedAt: now,
    status: 'active',
    tags: [],
    projectDocument: undefined, // Document will be created on first message
    messageQueue: [], // Initialize empty queue
    isProcessingQueue: false, // Initialize as not processing
    language: language || 'English', // Set detected language or default to English
  };

  chatSessions.set(sessionId, newSession);
  console.log(`Created new chat session: ${sessionId} with language: ${language || 'English'}`);

  return newSession;
}

/**
 * Helper function to get chat session by ID
 * @param sessionId - Chat session ID
 * @returns Chat session or undefined
 */
export function getChatSession(sessionId: string): ChatSession | undefined {
  return chatSessions.get(sessionId);
}

/**
 * Helper function to update chat session
 * @param sessionId - Chat session ID
 * @param updates - Partial updates to apply
 * @returns Success status
 */
export function updateChatSession(sessionId: string, updates: Partial<ChatSession>): boolean {
  const session = chatSessions.get(sessionId);
  if (!session) {
    return false;
  }

  const updatedSession = {
    ...session,
    ...updates,
    updatedAt: new Date(),
  };

  chatSessions.set(sessionId, updatedSession);
  return true;
}
