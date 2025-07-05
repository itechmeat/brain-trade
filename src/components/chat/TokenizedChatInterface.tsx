/**
 * Tokenized Chat Interface
 *
 * This component combines existing chat with tokenization.
 * User spends expert tokens to get AI consultations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTokenizedChat } from '@/hooks/useTokenizedChat';
import { useContracts } from '@/hooks/useContracts';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ExpertInfo } from '@/types/contracts';
import { SimpleMessageInput } from './SimpleMessageInput';
import { Button, Card, Dialog, TokenBalance, ConsultationCost } from '@/components/ui';
import { TokenPurchase } from '@/components/blockchain/TokenPurchase';
import styles from './TokenizedChatInterface.module.scss';
import { SimpleExpertAvatar } from '@/components/experts/SimpleExpertAvatar';

interface TokenizedChatInterfaceProps {
  /** Selected expert for consultation */
  selectedExpert: ExpertInfo | null;
  /** Callback when expert changes */
  onExpertChange?: (expert: ExpertInfo | null) => void;
}

/**
 * Main tokenized chat component
 *
 * Logic:
 * 1. Check user token balance
 * 2. If enough tokens - allow chat
 * 3. When sending message - deduct tokens
 * 4. Start AI dialogue with expert
 * 5. After response - distribute revenue
 */
export function TokenizedChatInterface({
  selectedExpert,
  // onExpertChange - not used in current implementation
}: TokenizedChatInterfaceProps) {
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
      console.log('📋 Loading experts...');
      loadExperts();
    }
  }, [isReady, experts.length, loading, loadExperts]);

  // Load balance when expert changes
  useEffect(() => {
    if (selectedExpert && contractsReady && selectedExpert.tokenAddress) {
      console.log(
        '🔍 Loading token balance for expert:',
        selectedExpert.name,
        selectedExpert.symbol,
        selectedExpert.tokenAddress,
      );
      setBalanceLoading(true);
      loadTokenBalance(selectedExpert).finally(() => setBalanceLoading(false));
    } else if (selectedExpert && !selectedExpert.tokenAddress) {
      console.warn('⚠️ Selected expert has no token address:', selectedExpert);
    }
  }, [selectedExpert, contractsReady, loadTokenBalance]);

  /**
   * Handle tokenized message sending
   */
  const handleTokenizedMessage = useCallback(
    async (content: string) => {
      if (!selectedExpert || !canAffordConsultation) {
        return;
      }

      try {
        if (!hasStartedChat) {
          // First message - start consultation
          await startTokenizedConsultation(selectedExpert, content);
          setHasStartedChat(true);
        } else {
          // Subsequent messages
          await sendTokenizedMessage(content, selectedExpert);
        }
      } catch (err) {
        console.error('Tokenized message failed:', err);
      }
    },
    [
      selectedExpert,
      canAffordConsultation,
      hasStartedChat,
      startTokenizedConsultation,
      sendTokenizedMessage,
    ],
  );

  /**
   * Handle successful token purchase
   */
  const handlePurchaseSuccess = useCallback(async () => {
    console.log('🎉 Purchase success! Closing modal and reloading balance...');
    setShowPurchaseModal(false);

    if (selectedExpert) {
      console.log('🔄 Force reloading token balance for:', selectedExpert.symbol);

      // Clear cache first to force fresh data
      clearBalanceCache();

      setBalanceLoading(true);
      // Delay to ensure transaction is confirmed on blockchain
      setTimeout(async () => {
        try {
          await loadTokenBalance(selectedExpert, true); // Force refresh after purchase
          console.log('✅ Balance reloaded after purchase');
        } catch (error) {
          console.error('❌ Failed to reload balance:', error);
        } finally {
          setBalanceLoading(false);
        }
      }, 1000); // Increased delay to 1 second for blockchain confirmation
    }
  }, [selectedExpert, loadTokenBalance, clearBalanceCache]);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: string) => {
    console.error('Purchase error:', error);
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
        <p>To use tokenized chat, you need to connect your wallet</p>
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
        <p>Switch to Zircuit Testnet to use tokenized chat</p>
        <Button onClick={handleNetworkSwitch} disabled={loading}>
          Switch Network
        </Button>
      </Card>
    );
  }

  // If no expert selected
  if (!selectedExpert) {
    return (
      <Card className={styles.selectExpert}>
        <h3>Select Expert</h3>
        <p>Choose an expert from the list to start consultation</p>
      </Card>
    );
  }

  return (
    <div className={styles.tokenizedChat}>
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
              <SimpleExpertAvatar expert={selectedExpert} size="medium" />
              <div>
                <h4>{selectedExpert.name}</h4>
                <p className={styles.category}>{selectedExpert.category}</p>
              </div>
            </div>

            {/* Debug button for clearing cache */}
            <button onClick={clearBalanceCache} className={styles.debugButton} type="button">
              🧹 Clear Cache
            </button>
          </div>

          <div className={styles.tokenBalance}>
            <div className={styles.balanceRow}>
              <span>Your balance:</span>
              <TokenBalance
                balance={tokenBalance}
                loading={balanceLoading}
                symbol={selectedExpert.symbol}
                size="medium"
                showAffordability={true}
              />
            </div>

            <div className={styles.balanceRow}>
              <span>Consultation cost:</span>
              <ConsultationCost
                cost={selectedExpert.tokensPerQuery}
                symbol={selectedExpert.symbol}
                isWeiFormat={true}
                size="medium"
              />
            </div>

            {/* Always show buy tokens button */}
            <div className={styles.tokenActions}>
              <Button size="sm" variant="outline" onClick={() => setShowPurchaseModal(true)}>
                Buy tokens
              </Button>
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
      {currentSession && (
        <div
          style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '12px' }}
        >
          <div>Session ID: {currentSession.id}</div>
          <div>Messages count: {currentSession.messages.length}</div>
          <div>Session status: {currentSession.status}</div>
          <div>
            Last message:{' '}
            {currentSession.messages[currentSession.messages.length - 1]?.content.substring(0, 50)}
            ...
          </div>
        </div>
      )}

      {/* Chat messages display */}
      {currentSession && currentSession.messages.length > 0 && (
        <div className={styles.messagesContainer}>
          <Card className={styles.messagesCard}>
            <h4>Chat History</h4>
            <div className={styles.messagesList}>
              {currentSession.messages.map(message => (
                <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>
                      {message.type === 'user' ? 'You' : selectedExpert.name}
                    </span>
                    <span className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={styles.messageContent}>{message.content}</div>
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
                : `Write your question to ${selectedExpert.name}...`
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
                cost={selectedExpert.tokensPerQuery}
                symbol={selectedExpert.symbol}
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
        title={`Buy ${selectedExpert?.symbol} tokens`}
        description={`Purchase tokens for consultation with ${selectedExpert?.name}`}
        size="md"
      >
        {selectedExpert && (
          <TokenPurchase
            expert={selectedExpert}
            onPurchaseSuccess={handlePurchaseSuccess}
            onPurchaseError={handlePurchaseError}
          />
        )}
      </Dialog>
    </div>
  );
}
