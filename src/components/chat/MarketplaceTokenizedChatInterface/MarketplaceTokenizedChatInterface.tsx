/**
 * Marketplace Tokenized Chat Interface
 *
 * Adapted version of TokenizedChatInterface for marketplace.
 * Works with MarketplaceExpert types and integrates with main page.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTokenizedChat } from '@/hooks/useTokenizedChat';
import { useContracts } from '@/hooks/useContracts';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { MarketplaceExpert } from '@/types/marketplace';
import { convertInvestmentExpertToExpertInfo } from '@/lib/marketplace-adapter';
import { SimpleMessageInput } from '../SimpleMessageInput';
import {
  Button,
  Card,
  Dialog,
  TokenBalance,
  ConsultationCost,
  TipButton,
  TransactionLink,
} from '@/components/ui';
import { TokenPurchase } from '@/components/blockchain/TokenPurchase';
import styles from './MarketplaceTokenizedChatInterface.module.scss';
import { SimpleExpertAvatar } from '@/components/experts/SimpleExpertAvatar';

interface MarketplaceTokenizedChatInterfaceProps {
  /** Selected marketplace expert for consultation */
  selectedExpert: MarketplaceExpert | null;
  /** Callback when expert changes */
  onExpertChange?: (expert: MarketplaceExpert | null) => void;
  /** Whether to show debug information */
  showDebugInfo?: boolean;
}

/**
 * Main marketplace tokenized chat component
 *
 * Logic:
 * 1. Convert MarketplaceExpert to ExpertInfo for compatibility
 * 2. Use existing tokenized chat hooks and components
 * 3. Handle blockchain operations through marketplace context
 * 4. Maintain compatibility with existing chat system
 */
export function MarketplaceTokenizedChatInterface({
  selectedExpert,
  showDebugInfo = false,
  // onExpertChange - not used in current implementation
}: MarketplaceTokenizedChatInterfaceProps) {
  // Convert MarketplaceExpert to ExpertInfo for tokenized chat
  const expertInfo = selectedExpert
    ? convertInvestmentExpertToExpertInfo(selectedExpert).expert
    : null;

  // Tokenized chat hook
  const {
    currentSession,
    tokenBalance,
    canAffordConsultation,
    processingConsultation,
    consultationSession,
    contractsReady,
    loading,
    error,
    loadTokenBalance,
    sendTokenizedMessage,
    startTokenizedConsultation,
  } = useTokenizedChat();

  // Blockchain hooks
  const { isCorrectChain, switchNetwork, experts, loadExperts, isReady, clearBalanceCache } =
    useContracts();

  // Privy hooks
  const { logout, connectWallet } = usePrivy();
  const { wallets } = useWallets();

  // State
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Load experts on initialization (only once)
  useEffect(() => {
    if (isReady && experts.length === 0 && !loading) {
      console.log('📋 Loading experts from marketplace...');
      loadExperts();
    }
  }, [isReady, experts.length, loading, loadExperts]);

  // Load balance when expert changes
  useEffect(() => {
    if (expertInfo && contractsReady && expertInfo.tokenAddress) {
      console.log(
        '🔍 Loading token balance for marketplace expert:',
        expertInfo.name,
        expertInfo.symbol,
        expertInfo.tokenAddress,
      );
      setBalanceLoading(true);
      loadTokenBalance(expertInfo).finally(() => setBalanceLoading(false));
    } else if (expertInfo && !expertInfo.tokenAddress) {
      console.warn('⚠️ Selected marketplace expert has no token address:', expertInfo);
    }
  }, [expertInfo, contractsReady, loadTokenBalance]);

  // Reset chat state when expert changes
  useEffect(() => {
    if (selectedExpert) {
      setHasStartedChat(false);
    }
  }, [selectedExpert]);

  /**
   * Handle tokenized message sending
   */
  const handleTokenizedMessage = useCallback(
    async (content: string) => {
      if (!expertInfo || !canAffordConsultation) {
        console.warn('⚠️ Cannot send marketplace message:', {
          hasExpert: !!expertInfo,
          canAfford: canAffordConsultation,
        });
        return;
      }

      console.log('📤 Sending marketplace tokenized message:', {
        content: content.substring(0, 50) + '...',
        expert: expertInfo.name,
        hasStartedChat,
        currentSessionId: currentSession?.id,
        messagesCount: currentSession?.messages.length || 0,
      });

      try {
        if (!hasStartedChat) {
          console.log('🚀 Starting new marketplace consultation...');
          // First message - start consultation
          await startTokenizedConsultation(expertInfo, content);
          setHasStartedChat(true);
          console.log('✅ Marketplace consultation started successfully');
        } else {
          console.log('💬 Sending subsequent marketplace message...');
          // Subsequent messages
          await sendTokenizedMessage(content, expertInfo);
          console.log('✅ Marketplace message sent successfully');
        }
      } catch (err) {
        console.error('❌ Marketplace tokenized message failed:', err);
      }
    },
    [
      expertInfo,
      canAffordConsultation,
      hasStartedChat,
      currentSession,
      startTokenizedConsultation,
      sendTokenizedMessage,
    ],
  );

  /**
   * Handle successful token purchase
   */
  const handlePurchaseSuccess = useCallback(async () => {
    console.log('🎉 Marketplace purchase success! Closing modal and reloading balance...');
    setShowPurchaseModal(false);

    if (expertInfo) {
      console.log('🔄 Force reloading token balance for marketplace expert:', expertInfo.symbol);

      // Clear cache first to force fresh data
      clearBalanceCache();

      setBalanceLoading(true);
      // Delay to ensure transaction is confirmed on blockchain
      setTimeout(async () => {
        try {
          await loadTokenBalance(expertInfo, true); // Force refresh after purchase
          console.log('✅ Marketplace balance reloaded after purchase');
        } catch (error) {
          console.error('❌ Failed to reload marketplace balance:', error);
        } finally {
          setBalanceLoading(false);
        }
      }, 1000); // Increased delay to 1 second for blockchain confirmation
    }
  }, [expertInfo, loadTokenBalance, clearBalanceCache]);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: string) => {
    console.error('Marketplace purchase error:', error);
    // Here you could show a toast notification
  }, []);

  /**
   * Switch network if needed
   */
  const handleNetworkSwitch = useCallback(async () => {
    try {
      await switchNetwork();
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  }, [switchNetwork]);

  // If no blockchain connection
  if (!contractsReady) {
    return (
      <Card className={styles.connectWallet}>
        <h3>Connect Wallet</h3>
        <p>To use marketplace tokenized chat, you need to connect your wallet</p>
        <div className={styles.walletActions}>
          <Button onClick={connectWallet}>Connect Wallet</Button>
          {wallets.length > 0 && (
            <Button variant="outline" onClick={logout}>
              Switch Wallet
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // If wrong network
  if (!isCorrectChain) {
    return (
      <Card className={styles.networkMismatch}>
        <h3>Wrong Network</h3>
        <p>Switch to Zircuit Testnet to use marketplace tokenized chat</p>
        <Button onClick={handleNetworkSwitch} disabled={loading}>
          Switch Network
        </Button>
      </Card>
    );
  }

  // If no expert selected
  if (!selectedExpert || !expertInfo) {
    return (
      <Card className={styles.selectExpert}>
        <h3>Select Expert</h3>
        <p>Choose an expert from the marketplace to start consultation</p>
      </Card>
    );
  }

  return (
    <div className={styles.marketplaceTokenizedChat}>
      {/* Wallet management */}
      <div className={styles.walletActions}>
        <Button variant="outline" size="sm" onClick={logout}>
          Switch Wallet
        </Button>
      </div>

      {/* Token information */}
      <div className={styles.tokenInfo}>
        <Card className={styles.tokenCard}>
          <div className={styles.expertHeader}>
            <div className={styles.expertInfo}>
              <SimpleExpertAvatar expert={expertInfo} size="medium" />
              <div>
                <h4>{expertInfo.name}</h4>
                <p className={styles.category}>{expertInfo.category}</p>
                <p className={styles.fund}>{selectedExpert.fund}</p>
              </div>
            </div>

            {/* Debug button for clearing cache */}
            {showDebugInfo && (
              <button onClick={clearBalanceCache} className={styles.debugButton} type="button">
                🧹 Clear Cache
              </button>
            )}
          </div>

          <div className={styles.tokenBalance}>
            <div className={styles.balanceRow}>
              <span>Your balance:</span>
              <TokenBalance
                balance={tokenBalance}
                loading={balanceLoading}
                symbol={expertInfo.symbol}
                size="medium"
                showAffordability={true}
              />
            </div>

            <div className={styles.balanceRow}>
              <span>Consultation cost:</span>
              <ConsultationCost
                cost={BigInt(expertInfo.tokensPerQuery)}
                symbol={expertInfo.symbol}
                isWeiFormat={true}
                size="medium"
              />
            </div>

            {/* Always show buy tokens button */}
            <div className={styles.tokenActions}>
              <Button size="sm" variant="outline" onClick={() => setShowPurchaseModal(true)}>
                Buy tokens
              </Button>

              {/* Tips button - always visible */}
              {expertInfo && (
                <TipButton
                  expert={expertInfo}
                  tokenBalance={tokenBalance}
                  onTipSent={() => {
                    // Reload balance after tip is sent
                    loadTokenBalance(expertInfo, true);
                  }}
                  disabled={processingConsultation || balanceLoading}
                />
              )}

              {!canAffordConsultation && tokenBalance && (
                <span className={styles.insufficientWarning}>
                  Insufficient tokens for consultation
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Debug info */}
      {showDebugInfo && currentSession && (
        <div className={styles.debugInfo}>
          <div>
            <strong>🔍 MARKETPLACE SESSION DEBUG INFO:</strong>
          </div>
          <div>📋 Session ID: {currentSession.id}</div>
          <div>💬 Messages count: {currentSession.messages.length}</div>
          <div>📊 Session status: {currentSession.status}</div>
          <div>🎯 Expert ID: {currentSession.expertId}</div>
          <div>🌐 Language: {currentSession.language}</div>
          <div>💭 Original idea: {currentSession.originalIdea?.substring(0, 50)}...</div>
          {consultationSession && (
            <div>
              💰 Current consultation: {consultationSession.status} |{' '}
              {consultationSession.transactionHash && (
                <TransactionLink
                  hash={consultationSession.transactionHash}
                  size="sm"
                  text="View TX"
                />
              )}
            </div>
          )}
          {currentSession.messages.length > 0 && (
            <div>
              🕐 Last message:{' '}
              {currentSession.messages[currentSession.messages.length - 1]?.content.substring(
                0,
                50,
              )}
              ... ({currentSession.messages[currentSession.messages.length - 1]?.type})
            </div>
          )}
        </div>
      )}

      {/* Chat messages display */}
      {currentSession && currentSession.messages.length > 0 && (
        <div className={styles.messagesContainer}>
          <Card className={styles.messagesCard}>
            <h4>Chat History ({currentSession.messages.length} messages)</h4>
            <div className={styles.messagesList}>
              {currentSession.messages.map((message, index) => (
                <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>
                      #{index + 1} - {message.type === 'user' ? 'You' : expertInfo.name}
                    </span>
                    <span className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={styles.messageContent}>
                    {message.content}
                    {message.metadata && (
                      <div className={styles.messageMetadata}>
                        {message.metadata.processingTime && (
                          <span>⏱️ {message.metadata.processingTime}ms</span>
                        )}
                        {message.metadata.ragMetadata && (
                          <span>
                            {' '}
                            | 🧠 RAG: {message.metadata.ragMetadata.contextChunks} chunks
                          </span>
                        )}
                        {message.metadata.transactionHash && (
                          <div style={{ marginTop: '4px' }}>
                            💰 Paid with:{' '}
                            <TransactionLink
                              hash={message.metadata.transactionHash}
                              size="sm"
                              text="View Transaction"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Chat interface */}
      <div className={styles.chatContainer}>
        <SimpleMessageInput
          onSendMessage={handleTokenizedMessage}
          disabled={!canAffordConsultation || processingConsultation}
          loading={processingConsultation}
          placeholder={
            !canAffordConsultation
              ? 'Insufficient tokens for consultation'
              : processingConsultation
                ? 'Consultation in progress...'
                : `Write your question to ${expertInfo.name}...`
          }
        />
      </div>

      {/* Consultation status */}
      {processingConsultation && (
        <div className={styles.consultationStatus}>
          <div className={styles.processingIndicator}>
            <div className={styles.spinner} />
            <span>Tokens deducted. Waiting for expert response...</span>
          </div>
        </div>
      )}

      {/* Consultation information */}
      {consultationSession && (
        <div className={styles.consultationInfo}>
          <Card className={styles.infoCard}>
            <h4>Active consultation</h4>
            <p>ID: {consultationSession.id}</p>
            <p>
              Cost:{' '}
              <ConsultationCost
                cost={BigInt(expertInfo.tokensPerQuery)}
                symbol={expertInfo.symbol}
                isWeiFormat={true}
                size="medium"
              />
            </p>
            <p>Status: {consultationSession.status}</p>
          </Card>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className={styles.errorContainer}>
          <Card className={styles.errorCard}>
            <h4>Error</h4>
            <p>{error}</p>
          </Card>
        </div>
      )}

      {/* Token purchase dialog */}
      <Dialog
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        title={`Buy ${expertInfo?.symbol} tokens`}
        description={`Purchase tokens for consultation with ${expertInfo?.name}`}
        size="md"
      >
        {expertInfo && (
          <TokenPurchase
            expert={expertInfo}
            onPurchaseSuccess={handlePurchaseSuccess}
            onPurchaseError={handlePurchaseError}
          />
        )}
      </Dialog>
    </div>
  );
}
