/**
 * Marketplace Tokenized Chat Interface
 *
 * Adapted version of TokenizedChatInterface for marketplace.
 * Works with MarketplaceExpert types and integrates with main page.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTokenizedChat } from '@/hooks/useTokenizedChat';
import { useContracts } from '@/hooks/useContracts';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePrivy } from '@privy-io/react-auth';
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
    canAffordConsultation,
    processingConsultation,
    consultationSession,
    contractsReady,
    loading,
    error,
    sendTokenizedMessage,
    startTokenizedConsultation,
    loadTokenBalance,
  } = useTokenizedChat();

  // Blockchain hooks
  const { isCorrectChain, switchNetwork, experts, loadExperts, isReady, clearBalanceCache } =
    useContracts();
  const { loadBalance, isLoaded, getBalance } = useTokenBalances();

  // Privy hooks
  const { connectWallet } = usePrivy();

  // State
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Stable handler for buy tokens
  const handleBuyTokensClick = useCallback(() => {
    console.log('🔘 Buy tokens button clicked');
    setShowPurchaseModal(true);
  }, []);

  // Find corresponding blockchain expert for purchasing
  const blockchainExpert = expertInfo && experts.length > 0 
    ? experts.find(e => e.symbol === expertInfo.symbol) 
    : null;

  // Get balance using useTokenBalances like on main page
  const marketplaceBalance = getBalance(expertInfo?.symbol || '');
  const balanceLoaded = isLoaded(expertInfo?.symbol || '');

  // Calculate if user can afford consultation locally
  const canAffordMarketplaceConsultation = marketplaceBalance && expertInfo 
    ? marketplaceBalance.balance >= BigInt(expertInfo.tokensPerQuery)
    : false;

  // Debug info
  console.log('💰 Marketplace balance debug:', {
    expertSymbol: expertInfo?.symbol,
    marketplaceBalance: marketplaceBalance?.balance?.toString(),
    tokensPerQuery: expertInfo?.tokensPerQuery,
    canAffordConsultation,
    canAffordMarketplaceConsultation,
    balanceLoaded
  });

  // Debug session info
  console.log('💬 Session debug:', {
    currentSession: currentSession?.id,
    messagesCount: currentSession?.messages.length || 0,
    hasStartedChat,
    processingConsultation
  });

  // Load experts on initialization (only once)
  useEffect(() => {
    if (isReady && experts.length === 0 && !loading) {
      console.log('📋 Loading experts from marketplace...');
      loadExperts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, experts.length, loading]);

  // Load balance when expert changes using both hooks
  useEffect(() => {
    if (expertInfo && contractsReady && experts.length > 0) {
      const blockchainExpert = experts.find(e => e.symbol === expertInfo.symbol);
      if (blockchainExpert) {
        console.log(
          '🔍 Loading token balance for marketplace expert:',
          expertInfo.name,
          expertInfo.symbol,
        );
        setBalanceLoading(true);
        
        // Load balance for useTokenBalances (for UI display)
        loadBalance(blockchainExpert).finally(() => setBalanceLoading(false));
        
        // Load balance for useTokenizedChat (for canAffordConsultation)
        loadTokenBalance(blockchainExpert);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertInfo?.symbol, contractsReady, experts.length]);

  // Reset chat state when expert changes
  useEffect(() => {
    if (selectedExpert) {
      setHasStartedChat(false);
    }
  }, [selectedExpert]);

  // Debug modal state changes
  useEffect(() => {
    console.log('💬 Modal state changed:', showPurchaseModal);
  }, [showPurchaseModal]);

  /**
   * Handle tokenized message sending
   */
  const handleTokenizedMessage = useCallback(
    async (content: string) => {
      if (!expertInfo || !canAffordConsultation) {
        console.warn('⚠️ Cannot send marketplace message:', {
          hasExpert: !!expertInfo,
          canAfford: canAffordConsultation,
          marketplaceBalance: marketplaceBalance?.balance?.toString(),
          tokensPerQuery: expertInfo?.tokensPerQuery,
        });
        return;
      }

      // Debug expert info being passed to tokenized chat
      console.log('🔍 Expert info being passed to startTokenizedConsultation:', {
        name: expertInfo.name,
        symbol: expertInfo.symbol,
        tokenAddress: expertInfo.tokenAddress,
        tokensPerQuery: expertInfo.tokensPerQuery,
        blockchainExpert: blockchainExpert,
        availableExperts: experts.map(e => ({symbol: e.symbol, tokenAddress: e.tokenAddress}))
      });

      console.log('📤 Sending marketplace tokenized message:', {
        content: content.substring(0, 50) + '...',
        expert: expertInfo.name,
        hasStartedChat,
        currentSessionId: currentSession?.id,
        messagesCount: currentSession?.messages.length || 0,
      });

      // Ensure we have blockchain expert with proper tokenAddress
      if (!blockchainExpert) {
        console.error('❌ No blockchain expert found for:', expertInfo.symbol);
        return;
      }

      try {
        if (!hasStartedChat) {
          console.log('🚀 Starting new marketplace consultation...');
          // First message - start consultation with blockchain expert
          await startTokenizedConsultation(blockchainExpert, content);
          setHasStartedChat(true);
          console.log('✅ Marketplace consultation started successfully');
        } else {
          console.log('💬 Sending subsequent marketplace message...');
          // Subsequent messages with blockchain expert
          await sendTokenizedMessage(content, blockchainExpert);
          console.log('✅ Marketplace message sent successfully');
        }
      } catch (err) {
        console.error('❌ Marketplace tokenized message failed:', err);
      }
    },
    [
      expertInfo,
      blockchainExpert,
      canAffordConsultation,
      marketplaceBalance,
      hasStartedChat,
      currentSession,
      startTokenizedConsultation,
      sendTokenizedMessage,
      experts,
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
          // Reload balance using useTokenBalances
          const blockchainExpert = experts.find(e => e.symbol === expertInfo.symbol);
          if (blockchainExpert) {
            await loadBalance(blockchainExpert, true); // Force refresh after purchase
          }
          console.log('✅ Marketplace balance reloaded after purchase');
        } catch (error) {
          console.error('❌ Failed to reload marketplace balance:', error);
        } finally {
          setBalanceLoading(false);
        }
      }, 1000); // Increased delay to 1 second for blockchain confirmation
    }
  }, [expertInfo, experts, loadBalance, clearBalanceCache]);

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
        <div className={styles.connectActions}>
          <Button onClick={connectWallet}>Connect Wallet</Button>
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
      {/* Expert card - matching main page style */}
      <div className={styles.expertCardContainer}>
        <div className={styles.expertCard}>
          <div className={styles.expertHeader}>
            <SimpleExpertAvatar expert={expertInfo} size="large" />
            <div className={styles.expertInfo}>
              <h4>{expertInfo.name}</h4>
              <p className={styles.fund}>{selectedExpert.fund}</p>
              <p className={styles.expertise}>{selectedExpert.description}</p>
              <div className={styles.pricing}>
                <div className={styles.pricingLeft}>
                  <span className={styles.cost}>
                    <ConsultationCost
                      cost={expertInfo.tokensPerQuery}
                      symbol={expertInfo.symbol}
                      isWeiFormat={false}
                      size="small"
                    /> per message
                  </span>
                </div>
                <div className={styles.pricingRight}>
                  <div className={styles.userBalance}>
                    <TokenBalance
                      balance={marketplaceBalance}
                      loading={!balanceLoaded}
                      symbol={expertInfo.symbol}
                      size="medium"
                      showAffordability={false}
                      showIcon={true}
                      iconSize={24}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Debug button for clearing cache */}
            {showDebugInfo && (
              <button onClick={clearBalanceCache} className={styles.debugButton} type="button">
                🧹 Clear Cache
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className={styles.tokenActions}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleBuyTokensClick}
              className={styles.actionButton}
              type="button"
            >
              Buy tokens
            </Button>

            {/* Tips button - same size */}
            {expertInfo && (
              <div className={styles.tipButtonWrapper}>
                <TipButton
                  expert={expertInfo}
                  tokenBalance={marketplaceBalance || null}
                  onTipSent={() => {
                    // Reload balance after tip is sent
                    if (experts.find(e => e.symbol === expertInfo.symbol)) {
                      loadBalance(experts.find(e => e.symbol === expertInfo.symbol)!, true);
                    }
                  }}
                  disabled={processingConsultation || balanceLoading}
                />
              </div>
            )}

            {marketplaceBalance && marketplaceBalance.balance < BigInt(expertInfo.tokensPerQuery) && (
              <span className={styles.insufficientWarning}>
                Insufficient tokens for consultation
              </span>
            )}
          </div>
        </div>
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
      <div className={styles.messagesContainer}>
        <Card className={styles.messagesCard}>
          <h4>Chat History ({currentSession?.messages.length || 0} messages)</h4>
          {currentSession && currentSession.messages.length > 0 ? (
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
                          <div className={styles.transactionLink}>
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
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              {hasStartedChat ? 'Loading messages...' : 'No messages yet. Start a conversation!'}
            </div>
          )}
        </Card>
      </div>

      {/* Chat interface */}
      <div className={styles.chatSection}>
        <div className={styles.chatHeader}>
          <h3>Ask {expertInfo.name}</h3>
        </div>
        <div className={styles.chatContainer}>
          <SimpleMessageInput
            onSendMessage={handleTokenizedMessage}
            disabled={!canAffordConsultation || processingConsultation || !balanceLoaded}
            loading={processingConsultation}
            placeholder={
              !balanceLoaded
                ? 'Loading balance...'
                : !canAffordConsultation
                  ? 'Insufficient tokens for consultation'
                  : processingConsultation
                    ? 'Tokens deducted. Waiting for expert response...'
                    : `Ask ${expertInfo.name} anything about investments...`
            }
          />
        </div>
      </div>



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
      >
        {blockchainExpert ? (
          <TokenPurchase
            expert={blockchainExpert}
            onPurchaseSuccess={handlePurchaseSuccess}
            onPurchaseError={handlePurchaseError}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            {experts.length === 0 ? 'Loading blockchain contracts...' : `Expert ${expertInfo?.symbol} not found in contracts`}
          </div>
        )}
      </Dialog>
    </div>
  );
}
