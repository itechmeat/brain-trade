import { useState, useCallback } from 'react';
import { ChatSession, ChatMessage } from '@/types/chat';

// Helper function to convert timestamps in message objects
function convertMessageTimestamps(message: Record<string, unknown>): ChatMessage {
  return {
    ...message,
    timestamp: new Date(message.timestamp as string),
  } as ChatMessage;
}

/**
 * Custom hook for managing chat state and operations
 */
export function useChat() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Starts a new chat session with a specific expert
   */
  const startNewChat = useCallback(async (idea: string, expertId: string): Promise<ChatSession> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting new chat session...');

      const sessionResponse = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalIdea: idea,
          expertId: expertId,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create chat session');
      }

      const sessionData = await sessionResponse.json();
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Session creation failed');
      }

      const session = sessionData.data;
      setCurrentSession(session);

      console.log('✅ Chat session created:', session.id);
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start chat';
      console.error('❌ Failed to start new chat:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sends a message and gets expert response
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!currentSession) {
        throw new Error('No active chat session');
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending message to expert...');

        const response = await fetch(`/api/chats/${currentSession.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            type: 'user',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Message sending failed');
        }

        // Update session with new messages
        const { userMessage, expertMessage } = responseData.data;
        const convertedUserMessage = convertMessageTimestamps(userMessage);
        const convertedExpertMessage = convertMessageTimestamps(expertMessage);

        setCurrentSession(prevSession => {
          if (!prevSession) return prevSession;

          return {
            ...prevSession,
            messages: [...prevSession.messages, convertedUserMessage, convertedExpertMessage],
            updatedAt: new Date(),
          };
        });

        console.log('✅ Message sent and expert response received');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        console.error('❌ Failed to send message:', errorMessage);
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession],
  );

  /**
   * Loads an existing chat session
   */
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading chat session:', sessionId);

      const response = await fetch(`/api/chats/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load chat session');
      }

      const sessionData = await response.json();
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Session loading failed');
      }

      const session = sessionData.data;
      // Convert message timestamps
      session.messages = session.messages.map(convertMessageTimestamps);

      setCurrentSession(session);
      console.log('✅ Chat session loaded:', session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      console.error('❌ Failed to load session:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current session
   */
  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
  }, []);

  return {
    // State
    currentSession,
    isLoading,
    error,

    // Actions
    startNewChat,
    sendMessage,
    loadSession,
    clearSession,
  };
}
