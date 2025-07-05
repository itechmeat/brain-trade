/**
 * Hook for tokenized chat functionality
 *
 * This hook combines chat logic with tokenization through smart contracts.
 * Provides token deduction when sending messages and completing consultations.
 */

import { useState, useCallback } from 'react';
import { useChat } from './useChat';
import { useContracts } from './useContracts';
import { ExpertInfo, ConsultationSession, TokenBalance } from '@/types/contracts';
import { ChatSession } from '@/types/chat';
import { getSlugFromExpertInfo } from '@/lib/expert-adapter';

interface TokenizedChatState {
  consultationSession: ConsultationSession | null;
  tokenBalance: TokenBalance | null;
  canAffordConsultation: boolean;
  processingConsultation: boolean;
}

/**
 * Hook for managing tokenized chat
 */
export function useTokenizedChat() {
  const {
    currentSession,
    startNewChat,
    loadSession,
    clearSession,
    isLoading: chatLoading,
    error: chatError,
  } = useChat();

  const {
    getTokenBalance,
    startConsultation,
    isReady: contractsReady,
    loading: contractsLoading,
    error: contractsError,
  } = useContracts();

  // Tokenized chat state
  const [tokenizedState, setTokenizedState] = useState<TokenizedChatState>({
    consultationSession: null,
    tokenBalance: null,
    canAffordConsultation: false,
    processingConsultation: false,
  });

  /**
   * Loading token balance for selected expert
   */
  const loadTokenBalance = useCallback(
    async (expert: ExpertInfo, forceRefresh?: boolean): Promise<void> => {
      if (!contractsReady) return;

      try {
        console.log(
          '🔄 Loading balance for expert:',
          expert.symbol,
          'with address:',
          expert.tokenAddress,
          forceRefresh ? '(force refresh)' : '(cached if available)',
        );
        const result = await getTokenBalance(expert.tokenAddress, undefined, forceRefresh);
        if (result.success && result.data) {
          console.log('✅ Balance loaded successfully:', result.data);
          console.log(
            `📊 Setting tokenized state: balance=${result.data.balance}, canAfford=${result.data.canAffordConsultation}`,
          );

          setTokenizedState(prev => ({
            ...prev,
            tokenBalance: result.data!,
            canAffordConsultation: result.data!.canAffordConsultation,
          }));
        } else {
          console.error('❌ Failed to load balance:', result.error);
        }
      } catch (err) {
        console.error('Failed to load token balance:', err);
      }
    },
    [contractsReady, getTokenBalance],
  );

  /**
   * Starting tokenized consultation
   */
  const startTokenizedConsultation = useCallback(
    async (expert: ExpertInfo, initialMessage: string): Promise<ChatSession> => {
      if (!contractsReady) {
        throw new Error('Contracts not ready');
      }

      if (!tokenizedState.canAffordConsultation) {
        throw new Error('Insufficient tokens for consultation');
      }

      setTokenizedState(prev => ({
        ...prev,
        processingConsultation: true,
      }));

      try {
        // Generate unique consultation ID
        const consultationId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Deduct tokens through smart contract
        const tokenResult = await startConsultation(expert.tokenAddress, consultationId);
        if (!tokenResult.success) {
          throw new Error(tokenResult.error || 'Failed to start consultation');
        }

        // Create consultation session
        const consultationSession: ConsultationSession = {
          id: consultationId,
          expertSymbol: expert.symbol,
          userAddress: '', // Will be filled later through contract
          tokensCost: BigInt(expert.tokensPerQuery),
          status: 'active',
          startedAt: new Date(),
          transactionHash: tokenResult.transaction?.hash || '',
        };

        // Create chat session (use slug for API compatibility)
        const expertSlug = getSlugFromExpertInfo(expert);

        // Create empty session first - startNewChat only creates session, doesn't send messages
        const chatSession = await startNewChat(initialMessage, expertSlug, true);

        // Now send the initial message to get expert response
        const response = await fetch(`/api/chats/${chatSession.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: initialMessage,
            type: 'user',
            expertSymbol: expert.symbol,
            transactionHash: tokenResult.transaction?.hash,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get expert response');
        }

        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Expert response failed');
        }

        // Load the session to get the updated messages from server
        await loadSession(chatSession.id);

        // Update state
        setTokenizedState(prev => ({
          ...prev,
          consultationSession,
          processingConsultation: false,
        }));

        // Update token balance
        await loadTokenBalance(expert, true);

        return chatSession;
      } catch (err) {
        setTokenizedState(prev => ({
          ...prev,
          processingConsultation: false,
        }));
        throw err;
      }
    },
    [
      contractsReady,
      tokenizedState.canAffordConsultation,
      startConsultation,
      startNewChat,
      loadTokenBalance,
      loadSession,
    ],
  );

  /**
   * Sending message in tokenized chat
   */
  const sendTokenizedMessage = useCallback(
    async (content: string, expert: ExpertInfo): Promise<void> => {
      if (!currentSession) {
        throw new Error('No active chat session');
      }

      if (!tokenizedState.canAffordConsultation) {
        throw new Error('Insufficient tokens for consultation');
      }

      setTokenizedState(prev => ({
        ...prev,
        processingConsultation: true,
      }));

      try {
        // Generate ID for new consultation
        const consultationId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Deduct tokens
        const tokenResult = await startConsultation(expert.tokenAddress, consultationId);
        if (!tokenResult.success) {
          throw new Error(tokenResult.error || 'Failed to start consultation');
        }

        // Send message to chat directly (like regular chat)
        const response = await fetch(`/api/chats/${currentSession.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            type: 'user',
            expertSymbol: expert.symbol,
            transactionHash: tokenResult.transaction?.hash,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get expert response');
        }

        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Expert response failed');
        }

        // Reload session to get updated messages from server
        await loadSession(currentSession.id);

        // Update consultation state
        setTokenizedState(prev => ({
          ...prev,
          consultationSession: {
            id: consultationId,
            expertSymbol: expert.symbol,
            userAddress: '',
            tokensCost: BigInt(expert.tokensPerQuery),
            status: 'completed',
            startedAt: new Date(),
            completedAt: new Date(),
            transactionHash: tokenResult.transaction?.hash || '',
          },
          processingConsultation: false,
        }));

        // Update token balance
        await loadTokenBalance(expert, true);
      } catch (err) {
        setTokenizedState(prev => ({
          ...prev,
          processingConsultation: false,
        }));
        throw err;
      }
    },
    [
      currentSession,
      tokenizedState.canAffordConsultation,
      startConsultation,
      loadTokenBalance,
      loadSession,
    ],
  );

  /**
   * Complete consultation
   */
  const completeConsultation = useCallback(() => {
    setTokenizedState(prev => ({
      ...prev,
      consultationSession: prev.consultationSession
        ? {
            ...prev.consultationSession,
            status: 'completed',
            completedAt: new Date(),
          }
        : null,
      processingConsultation: false,
    }));
  }, []);

  /**
   * Reset tokenized state
   */
  const resetTokenizedState = useCallback(() => {
    setTokenizedState({
      consultationSession: null,
      tokenBalance: null,
      canAffordConsultation: false,
      processingConsultation: false,
    });
    clearSession();
  }, [clearSession]);

  return {
    // Chat state
    currentSession,
    messages: currentSession?.messages || [],
    chatLoading,
    chatError,

    // Tokenization state
    ...tokenizedState,
    contractsReady,
    contractsLoading,
    contractsError,

    // Overall loading state
    loading: chatLoading || contractsLoading || tokenizedState.processingConsultation,
    error: chatError || contractsError,

    // Functions
    loadTokenBalance,
    startTokenizedConsultation,
    sendTokenizedMessage,
    completeConsultation,
    resetTokenizedState,
    loadSession,
    clearSession,
  };
}
