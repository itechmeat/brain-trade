import { useState, useCallback } from 'react';
import { ChatSession, ChatMessage } from '@/types';
import investmentExperts from '@/data/investment_experts.json';
import type { InvestmentExpert } from '@/types/expert';

/**
 * Converts timestamp strings to Date objects for ChatMessage objects
 * @param message - ChatMessage that may contain timestamp strings
 * @returns ChatMessage with converted Date objects
 */
function convertMessageTimestamps(message: Record<string, unknown>): ChatMessage {
  const result = { ...message } as unknown as ChatMessage;

  // Convert timestamp to Date object
  if (result.timestamp && typeof result.timestamp === 'string') {
    result.timestamp = new Date(result.timestamp);
  }

  return result;
}

// Global flag to prevent duplicate queue processing
let isQueueProcessingGlobally = false;

export function useChat() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSpeakers, setCurrentSpeakers] = useState<string[]>([]);
  const [isQueueStopped, setIsQueueStopped] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isApplyingRecommendations, setIsApplyingRecommendations] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [hasUnreadDocumentChanges, setHasUnreadDocumentChanges] = useState(false);

  /**
   * Creates initial random queue for experts with user at the end
   * @param experts - Array of expert slugs
   * @returns Shuffled array of expert slugs with 'user' at the end
   */
  const createInitialQueue = useCallback((experts: string[]): string[] => {
    const shuffled = [...experts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Add user at the end of the queue
    shuffled.push('user');
    return shuffled;
  }, []);

  /**
   * Adds speaker to queue, avoiding consecutive duplicates
   * @param queue - Current queue
   * @param speaker - Speaker to add
   * @returns Updated queue
   */
  const addToQueue = useCallback((queue: string[], speaker: string): string[] => {
    if (queue.length === 0 || queue[queue.length - 1] !== speaker) {
      return [...queue, speaker];
    }
    return queue;
  }, []);

  /**
   * Process next single expert in queue - truly sequential
   * @param sessionOverride - Optional session to use instead of currentSession
   */
  const processNextExpert = useCallback(
    async (sessionOverride?: ChatSession) => {
      const sessionToUse = sessionOverride || currentSession;

      if (!sessionToUse || isProcessingQueue || isQueueStopped || isQueueProcessingGlobally) {
        console.log('🛑 Cannot process next expert:', {
          hasSession: !!sessionToUse,
          isProcessing: isProcessingQueue,
          isStopped: isQueueStopped,
          globallyProcessing: isQueueProcessingGlobally,
          usingOverride: !!sessionOverride,
        });
        return;
      }

      if (!sessionToUse.messageQueue || sessionToUse.messageQueue.length === 0) {
        console.log('✅ Queue is empty - nothing to process');
        return;
      }

      const nextSpeaker = sessionToUse.messageQueue[0];

      // Stop if user is next
      if (nextSpeaker === 'user') {
        console.log('👤 User is next in queue, waiting for user input');
        return;
      }

      console.log('🗣️ Processing ONE expert:', nextSpeaker);
      setIsProcessingQueue(true);
      setCurrentSpeakers([nextSpeaker]);
      setIsLoading(true);
      isQueueProcessingGlobally = true;

      try {
        // Send request for ONE expert
        const response = await fetch(`/api/chats/${sessionToUse.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Continue the conversation based on the current context',
            type: 'expert',
            expertId: nextSpeaker,
          }),
        });

        if (!response.ok) {
          console.error('❌ API request failed');
          setIsProcessingQueue(false);
          setCurrentSpeakers([]);
          setIsLoading(false);
          return;
        }

        const responseData = await response.json();
        if (!responseData.success) {
          console.error('❌ API returned error:', responseData.error);
          setIsProcessingQueue(false);
          setCurrentSpeakers([]);
          setIsLoading(false);
          return;
        }

        const expertResponse = convertMessageTimestamps(responseData.data.message);
        console.log('✅ Got response from expert:', nextSpeaker);

        // Update session: add message and remove processed expert from queue
        setCurrentSession(prevSession => {
          if (!prevSession) return prevSession;

          const remainingQueue = prevSession.messageQueue!.slice(1);
          let newQueue = remainingQueue;

          // If expert specified nextSpeaker, add to queue
          if (expertResponse.metadata?.nextSpeaker) {
            newQueue = addToQueue(newQueue, expertResponse.metadata.nextSpeaker);
            console.log('➕ Expert specified nextSpeaker, updated queue:', newQueue);
          }

          console.log('📋 Updated queue:', newQueue);

          return {
            ...prevSession,
            messages: [...prevSession.messages, expertResponse],
            messageQueue: newQueue,
            updatedAt: new Date(),
          };
        });

        setIsProcessingQueue(false);
        setCurrentSpeakers([]);
        setIsLoading(false);
        isQueueProcessingGlobally = false;

        // IMPORTANT: Only continue if there are more experts (not user)
        const remainingQueue = sessionToUse.messageQueue.slice(1);
        if (remainingQueue.length > 0 && remainingQueue[0] !== 'user' && !isQueueStopped) {
          console.log('🔄 More experts in queue, continuing with next...');
          // Continue processing with updated session state
          setTimeout(() => {
            setCurrentSession(latestSession => {
              if (latestSession && !isQueueProcessingGlobally) {
                console.log(
                  '🚀 Continuing with updated session, next expert:',
                  latestSession.messageQueue?.[0],
                );
                processNextExpert(latestSession);
              } else {
                console.log('⏸️ Skipping continuation - already processing globally or no session');
              }
              return latestSession;
            });
          }, 100);
        } else {
          console.log('⏹️ Reached end of expert queue or user is next');
        }
      } catch (error) {
        console.error('❌ Error processing expert:', error);
        setIsProcessingQueue(false);
        setCurrentSpeakers([]);
        setIsLoading(false);
        isQueueProcessingGlobally = false;
      }
    },
    [currentSession, isProcessingQueue, isQueueStopped, addToQueue],
  );

  /**
   * Stops the message queue processing
   */
  const stopQueue = useCallback(() => {
    setIsQueueStopped(true);
    console.log('Message queue stopped');
  }, []);

  /**
   * Resumes the message queue processing
   */
  const resumeQueue = useCallback(() => {
    setIsQueueStopped(false);
    console.log('Message queue resumed');

    // Continue processing if there's an active session
    if (currentSession && currentSession.messageQueue && currentSession.messageQueue.length > 0) {
      console.log('🚀 RESUMING QUEUE from resumeQueue with:', currentSession.messageQueue[0]);
      processNextExpert();
    }
  }, [processNextExpert, currentSession]);

  const startNewChat = useCallback(
    async (idea: string): Promise<ChatSession> => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Starting new chat with real API...');

        // Step 1: Create project document using AI
        const documentResponse = await fetch('/api/ideas/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea }),
        });

        if (!documentResponse.ok) {
          throw new Error('Failed to analyze idea and create document');
        }

        const documentData = await documentResponse.json();
        if (!documentData.success) {
          throw new Error(documentData.error || 'Document creation failed');
        }

        const {
          projectDocument,
          projectTitle,
          detectedLanguage,
          assistantMessage: generatedAssistantMessage,
        } = documentData.data;

        // Step 2: Create chat session
        const sessionResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalIdea: idea,
            experts: ['bhorowitz', 'peterthiel', 'sgblank'],
            language: detectedLanguage,
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

        // Update session with the generated document
        session.projectDocument = projectDocument;
        session.title = projectTitle || session.title;

        // Update session on server with the document
        const updateResponse = await fetch(`/api/chats/${session.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectDocument,
            title: projectTitle || session.title,
          }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update session with document on server');
          // Continue anyway since we have the document locally
        }

        // Create initial user message with the original idea
        const now = new Date();
        const userMessage: ChatMessage = {
          id: 'user-initial-1',
          chatId: session.id,
          content: idea,
          timestamp: now,
          type: 'user',
        };

        // Create assistant message about document creation (slightly later timestamp)
        const assistantMessage: ChatMessage = {
          id: 'assistant-doc-1',
          chatId: session.id,
          expertId: 'assistant',
          content: generatedAssistantMessage,
          timestamp: new Date(now.getTime() + 1000), // 1 second later
          type: 'expert',
          metadata: {
            confidence: 0.95,
            reasoning: 'AI-generated document structuring based on user input',
          },
        };

        // Add both messages to session
        session.messages.push(userMessage);
        session.messages.push(assistantMessage);

        // Create initial queue for experts
        const initialQueue = createInitialQueue(session.experts);
        session.messageQueue = initialQueue;
        session.isProcessingQueue = false;

        console.log('📋 INITIAL QUEUE CREATED:', initialQueue);

        console.log('Session created, starting expert queue...');
        console.log('📋 SESSION STATE BEFORE QUEUE START:', {
          hasQueue: !!session.messageQueue,
          queueLength: session.messageQueue?.length,
          isProcessing: session.isProcessingQueue,
        });

        setCurrentSession(session);

        // Start processing queue immediately with the session data
        console.log('🚀 STARTING QUEUE PROCESSING immediately');
        console.log('🔍 Session before timeout:', {
          hasSession: !!session,
          queueLength: session.messageQueue?.length,
          firstExpert: session.messageQueue?.[0],
        });

        // Use setTimeout to ensure React state is updated first
        setTimeout(() => {
          console.log('⏰ Starting queue processing after state update');
          console.log('🔍 currentSession in timeout:', {
            hasCurrentSession: !!currentSession,
            queueLength: currentSession?.messageQueue?.length,
            firstExpert: currentSession?.messageQueue?.[0],
            isProcessing: isProcessingQueue,
            isStopped: isQueueStopped,
          });

          // Use the passed session since currentSession might not be updated yet
          console.log('🚀 Starting with passed session instead of currentSession');
          processNextExpert(session);
        }, 200);

        return session;
      } catch (err) {
        console.error('Error starting new chat:', err);
        const errorMessage = err instanceof Error ? err.message : 'Chat creation error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createInitialQueue, processNextExpert, currentSession, isProcessingQueue, isQueueStopped],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentSession) {
        throw new Error('No active chat session');
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending user message through assistant...');

        // Send user message to API - it will handle analysis and expert responses
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
          throw new Error(responseData.error || 'Message send failed');
        }

        const { userMessage, assistantMessage, expertResponses, updatedDocument, nextSpeakers } =
          responseData.data;

        // Convert timestamp strings to Date objects
        const convertedUserMessage = convertMessageTimestamps(userMessage);
        const convertedAssistantMessage = convertMessageTimestamps(assistantMessage);
        const convertedExpertResponses = expertResponses
          ? expertResponses.map(convertMessageTimestamps)
          : [];

        console.log('Received response from API:', {
          hasUserMessage: !!convertedUserMessage,
          hasAssistantMessage: !!convertedAssistantMessage,
          expertResponseCount: convertedExpertResponses.length,
          hasDocumentUpdate: !!updatedDocument,
          nextSpeakers,
        });

        // Update session with all new messages and queue
        setCurrentSession(prevSession => {
          if (!prevSession) return prevSession;

          const newMessages = [
            ...prevSession.messages,
            convertedUserMessage,
            convertedAssistantMessage,
            ...convertedExpertResponses,
          ];

          // Create new queue from nextSpeakers if provided
          const newQueue =
            nextSpeakers && nextSpeakers.length > 0 ? nextSpeakers : prevSession.messageQueue || [];

          console.log('📋 UPDATING SESSION WITH NEW QUEUE:', newQueue);

          return {
            ...prevSession,
            messages: newMessages,
            messageQueue: newQueue,
            projectDocument: updatedDocument || prevSession.projectDocument,
            isProcessingQueue: false,
            updatedAt: new Date(),
          };
        });

        // Check for document changes after state update
        if (updatedDocument) {
          setCurrentSession(latestSession => {
            if (latestSession && updatedDocument !== latestSession.projectDocument) {
              setHasUnreadDocumentChanges(true);
            }
            return latestSession;
          });
        }

        console.log('Session updated with assistant response and starting queue processing...');

        // Start processing the queue if there are experts to process
        if (nextSpeakers && nextSpeakers.length > 0) {
          console.log('🚀 STARTING QUEUE PROCESSING for user message response');
          // Use a small delay to ensure state update
          setTimeout(() => {
            setCurrentSession(latestSession => {
              if (latestSession && !isQueueProcessingGlobally && !isQueueStopped) {
                console.log(
                  '🔥 Processing first expert from queue:',
                  latestSession.messageQueue?.[0],
                );
                processNextExpert(latestSession);
              }
              return latestSession;
            });
          }, 100);
        }
      } catch (err) {
        console.error('Error sending message:', err);
        const errorMessage = err instanceof Error ? err.message : 'Message send error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, isQueueStopped, processNextExpert],
  );

  const endSession = useCallback(() => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        status: 'completed' as const,
        updatedAt: new Date(),
      };
      setCurrentSession(updatedSession);
    }
  }, [currentSession]);

  /**
   * Opens the document modal
   */
  const openDocumentModal = useCallback(() => {
    setIsDocumentModalOpen(true);
    // Mark document as read when opened
    setHasUnreadDocumentChanges(false);
  }, []);

  /**
   * Closes the document modal
   */
  const closeDocumentModal = useCallback(() => {
    setIsDocumentModalOpen(false);
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
    setIsDocumentModalOpen(false);
    setHasUnreadDocumentChanges(false);
  }, []);

  const handleReaction = useCallback(
    (messageId: string, reaction: 'like' | 'dislike' | null) => {
      if (!currentSession) return;

      const updatedMessages = currentSession.messages.map(message =>
        message.id === messageId ? { ...message, userReaction: reaction } : message,
      );

      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: new Date(),
      };

      setCurrentSession(updatedSession);
    },
    [currentSession],
  );

  const handleApplyRecommendations = useCallback(
    async (messageId: string, selectedRecommendations: string[]) => {
      if (!currentSession) return;

      const message = currentSession.messages.find(m => m.id === messageId);
      if (!message || !selectedRecommendations || selectedRecommendations.length === 0) return;

      setIsLoading(true);
      setIsApplyingRecommendations(true);
      setCurrentSpeakers(['assistant']);
      setError(null);

      try {
        console.log('Applying recommendations via real API...');

        // Call the apply recommendations API
        const response = await fetch(`/api/chats/${currentSession.id}/apply-recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId,
            selectedRecommendations,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to apply recommendations');
        }

        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Recommendation application failed');
        }

        const { updatedDocument, assistantMessage, changes } = responseData.data;

        console.log(`Recommendations applied successfully. Changes: ${changes.join(', ')}`);

        // Update session with the new document and add assistant message
        setCurrentSession(prevSession => {
          if (!prevSession) return prevSession;

          const currentApplied = prevSession.appliedRecommendations || [];
          const newApplied = [...currentApplied, ...selectedRecommendations];

          return {
            ...prevSession,
            projectDocument: updatedDocument,
            messages: [...prevSession.messages, assistantMessage],
            appliedRecommendations: newApplied,
            updatedAt: new Date(),
          };
        });

        // Check for document changes after state update
        if (updatedDocument) {
          setHasUnreadDocumentChanges(true);
        }

        // Show success feedback (could trigger a toast notification here)
        console.log('Document updated with expert recommendations');
      } catch (err) {
        console.error('Error applying recommendations:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to apply recommendations';
        setError(errorMessage);

        // Fallback: Add a message indicating the issue
        const fallbackMessage = {
          id: `assistant-error-${Date.now()}`,
          chatId: currentSession.id,
          expertId: 'assistant',
          content: `I'm having trouble applying those recommendations right now. The technical issue is: ${errorMessage}. Please try again in a moment.`,
          timestamp: new Date(),
          type: 'expert' as const,
          metadata: {
            confidence: 0.1,
            reasoning: 'Error fallback message',
          },
        };

        setCurrentSession(prevSession => {
          if (!prevSession) return prevSession;
          return {
            ...prevSession,
            messages: [...prevSession.messages, fallbackMessage],
            updatedAt: new Date(),
          };
        });
      } finally {
        setIsLoading(false);
        setIsApplyingRecommendations(false);
        setCurrentSpeakers([]);
      }
    },
    [currentSession],
  );

  return {
    currentSession,
    isLoading,
    error,
    currentSpeakers,
    startNewChat,
    sendMessage,
    endSession,
    clearSession,
    handleReaction,
    handleApplyRecommendations,
    stopQueue,
    resumeQueue,
    isQueueStopped,
    isApplyingRecommendations,
    experts: investmentExperts as InvestmentExpert[],
    // Document modal state
    isDocumentModalOpen,
    hasUnreadDocumentChanges,
    openDocumentModal,
    closeDocumentModal,
  };
}
