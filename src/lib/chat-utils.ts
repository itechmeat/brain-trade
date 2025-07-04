import { nanoid } from 'nanoid';
import { ChatSession } from '@/types/chat';

// Store for chat sessions (in production this will be database)
// Use globalThis to persist across hot reloads in development
const globalForSessions = globalThis as unknown as {
  chatSessions: Map<string, ChatSession> | undefined;
};

const chatSessions = globalForSessions.chatSessions ?? new Map<string, ChatSession>();

if (process.env.NODE_ENV !== 'production') {
  globalForSessions.chatSessions = chatSessions;
}

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
 * @param expertId - Single expert ID for 1:1 chat
 * @param language - Detected language for consistent responses
 * @param customId - Optional custom session ID
 * @returns Created chat session
 */
export function createChatSession(
  originalIdea: string,
  expertId: string,
  language?: string,
  customId?: string,
): ChatSession {
  const sessionId = customId || nanoid(12);

  // Check if session with this ID already exists
  if (customId && chatSessions.has(customId)) {
    console.log(`Session with ID ${customId} already exists, returning existing session`);
    return chatSessions.get(customId)!;
  }

  const now = new Date();

  const newSession: ChatSession = {
    id: sessionId,
    title: `Chat Session - ${now.toLocaleDateString()}`,
    originalIdea,
    expertId, // Single expert ID for 1:1 chat
    messages: [],
    createdAt: now,
    updatedAt: now,
    status: 'active',
    tags: [],
    language: language || 'English', // Set detected language or default to English
  };

  chatSessions.set(sessionId, newSession);
  console.log(
    `Created new chat session: ${sessionId} with expert: ${expertId} and language: ${language || 'English'}`,
  );

  return newSession;
}

/**
 * Helper function to get chat session by ID
 * @param sessionId - Chat session ID
 * @returns Chat session or undefined
 */
export function getChatSession(sessionId: string): ChatSession | undefined {
  console.log(`Looking for session: ${sessionId}`);
  console.log(`Available sessions:`, Array.from(chatSessions.keys()));
  console.log(`Total sessions in map:`, chatSessions.size);
  const session = chatSessions.get(sessionId);
  console.log(`Found session:`, !!session);
  return session;
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
