/**
 * Marketplace Expert Selector Component
 *
 * Component for selecting an expert from marketplace with blockchain integration.
 * Adapted version of ExpertSelector for main page using InvestmentExpert types.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Removed DotFilledIcon import as it's now in TokenBalanceWithIcon
import { InvestmentExpert } from '@/types/expert';
import { MarketplaceExpert } from '@/types/marketplace';
import {
  Card,
  TokenBalance,
  ConsultationCost,
  Dialog,
  Button,
  LoadingSpinner,
} from '@/components/ui';
import { TokenPurchase } from '@/components/blockchain/TokenPurchase';
import { SimpleExpertAvatar } from '../SimpleExpertAvatar';
import { createMarketplaceExpert } from '@/lib/marketplace-adapter';
import { useContracts } from '@/hooks/useContracts';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import styles from './MarketplaceExpertSelector.module.scss';

interface MarketplaceExpertSelectorProps {
  /** Available experts from main page */
  experts: InvestmentExpert[];
  /** Whether to show token information */
  showTokenInfo?: boolean;
  /** Whether to show blockchain features */
  showBlockchainFeatures?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
}

/**
 * Component for selecting an expert from marketplace
 *
 * Logic:
 * 1. Convert InvestmentExpert to MarketplaceExpert
 * 2. Load token balances for blockchain-enabled experts
 * 3. Show purchase options for insufficient balances
 * 4. Handle expert selection with blockchain context
 */
export function MarketplaceExpertSelector({
  experts,
  showTokenInfo = true,
  showBlockchainFeatures = true,
  loading = false,
  error = null,
}: MarketplaceExpertSelectorProps) {
  // Blockchain hooks
  const {
    experts: blockchainExperts,
    loadExperts,
    isCorrectChain,
    isReady: contractsReady,
  } = useContracts();
  const { loadBalances, isLoaded, getBalance } = useTokenBalances();

  // Local state
  const [marketplaceExperts, setMarketplaceExperts] = useState<MarketplaceExpert[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseExpert, setPurchaseExpert] = useState<MarketplaceExpert | null>(null);

  /**
   * Convert InvestmentExpert to MarketplaceExpert with blockchain data
   */
  useEffect(() => {
    if (!experts.length) return;

    const convertedExperts = experts.map(expert => {
      const balance = getBalance(expert.token || expert.slug);
      return createMarketplaceExpert(expert, balance, {
        includeBlockchain: showBlockchainFeatures && contractsReady,
        includeUserBalances: true,
      });
    });

    setMarketplaceExperts(convertedExperts);
  }, [experts, contractsReady, showBlockchainFeatures, getBalance]);

  /**
   * Load blockchain experts on initialization
   */
  useEffect(() => {
    if (contractsReady && blockchainExperts.length === 0) {
      loadExperts();
    }
  }, [contractsReady, blockchainExperts.length, loadExperts]);

  /**
   * Load token balances for blockchain experts
   */
  useEffect(() => {
    if (blockchainExperts.length > 0 && contractsReady) {
      console.log('🔄 Loading balances for', blockchainExperts.length, 'blockchain experts');
      loadBalances(blockchainExperts);
    }
  }, [blockchainExperts, contractsReady, loadBalances]);

  // Expert selection is now handled by Link navigation

  /**
   * Handle token purchase
   */
  const handlePurchaseClick = (expert: MarketplaceExpert) => {
    setPurchaseExpert(expert);
    setShowPurchaseModal(true);
  };

  /**
   * Handle successful token purchase
   */
  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setPurchaseExpert(null);

    // Reload balances after purchase
    if (purchaseExpert && showBlockchainFeatures) {
      const expertInfo = {
        name: purchaseExpert.name,
        symbol: purchaseExpert.token || purchaseExpert.slug,
        category: purchaseExpert.fund || 'Investment Expert',
        tokensPerQuery: purchaseExpert.tokensPerQuery || 10,
        isActive: true,
        tokenAddress: purchaseExpert.blockchain?.tokenAddress || '',
        expertAddress: purchaseExpert.blockchain?.tokenAddress || '',
        totalConsultations: 0,
        totalRevenue: 0,
      };

      setTimeout(() => {
        loadBalances([expertInfo]);
      }, 1000);
    }
  };

  /**
   * Handle purchase error
   */
  const handlePurchaseError = (error: string) => {
    console.error('Purchase error:', error);
    // Could show toast notification here
  };

  if (loading) {
    return (
      <LoadingSpinner
        title="Loading Experts"
        subtitle="Connecting to blockchain and loading expert profiles..."
      />
    );
  }

  if (error) {
    return (
      <Card className={styles.errorCard}>
        <h3>Error loading experts</h3>
        <p>{error}</p>
      </Card>
    );
  }

  if (!marketplaceExperts.length) {
    return (
      <Card className={styles.noExperts}>
        <h3>No experts available</h3>
        <p>No investment experts are currently available</p>
      </Card>
    );
  }

  return (
    <div className={styles.marketplaceExpertSelector}>
      <h3>Select an expert for consultation</h3>

      {/* Blockchain connection warning */}
      {showBlockchainFeatures && !contractsReady && (
        <Card className={styles.blockchainWarning}>
          <p>Connect your wallet to access blockchain features</p>
        </Card>
      )}

      {showBlockchainFeatures && contractsReady && !isCorrectChain && (
        <Card className={styles.networkWarning}>
          <p>Switch to Zircuit Testnet to use tokenized consultations</p>
        </Card>
      )}

      <div className={styles.expertList}>
        {marketplaceExperts.map(expert => {
          const balance = getBalance(expert.token || expert.slug);
          const balanceLoaded = isLoaded(expert.token || expert.slug);
          const canAfford = balance && balance.balance >= BigInt(expert.tokensPerQuery || 10);
          const chatId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const chatUrl = `/chat/${expert.slug}/${chatId}`;

          return (
            <div key={expert.slug} className={styles.expertCardWrapper}>
              <Link href={chatUrl} className={styles.expertCard}>
                <div className={styles.expertHeader}>
                  <SimpleExpertAvatar
                    expert={{
                      name: expert.name,
                      symbol: expert.token || expert.slug,
                      category: expert.fund || 'Investment Expert',
                      tokensPerQuery: expert.tokensPerQuery || 10,
                      isActive: true,
                      tokenAddress: expert.blockchain?.tokenAddress || '',
                      expertAddress: expert.blockchain?.tokenAddress || '',
                      totalConsultations: 0,
                      totalRevenue: 0,
                    }}
                    size="large"
                  />
                  <div className={styles.expertInfo}>
                    <h4>{expert.name}</h4>
                    <p className={styles.fund}>{expert.fund}</p>
                    <p className={styles.expertise}>{expert.expertise}</p>
                    <div className={styles.pricing}>
                      <div className={styles.pricingLeft}>
                        <span className={styles.tokenSymbol}>
                          {expert.token || `BT${expert.slug.toUpperCase()}`}
                        </span>
                        <span className={styles.cost}>
                          {expert.tokensPerQuery || 10} tokens per message
                        </span>
                      </div>
                      <div className={styles.pricingRight}>
                        <TokenBalance
                          balance={balance}
                          loading={!balanceLoaded}
                          symbol={expert.token || expert.slug}
                          size="small"
                          showAffordability={false}
                          showIcon={true}
                          iconSize={20}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {showTokenInfo && showBlockchainFeatures && expert.blockchain?.isActive && (
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenHeader}>
                      <span className={styles.tokenSymbol}>
                        {expert.token || `BT${expert.slug.toUpperCase()}`}
                      </span>
                      <span className={styles.tokenLabel}>Token</span>
                    </div>

                    <div className={styles.tokenRow}>
                      <span>Cost per message:</span>
                      <div className={styles.costInfo}>
                        <ConsultationCost
                          cost={BigInt(expert.tokensPerQuery || 10)}
                          symbol={expert.token || expert.slug}
                          isWeiFormat={true}
                          size="small"
                        />
                      </div>
                    </div>

                    <div className={styles.tokenRow}>
                      <span>Your balance:</span>
                      <TokenBalance
                        balance={balance}
                        loading={!balanceLoaded}
                        symbol={expert.token || expert.slug}
                        size="small"
                        showAffordability={true}
                      />
                    </div>

                    {balance && !canAfford && (
                      <div className={styles.insufficientWarning}>
                        <span>⚠️ Insufficient tokens</span>
                      </div>
                    )}
                  </div>
                )}
              </Link>

              {/* Buy tokens button outside the link */}
              {showTokenInfo &&
                showBlockchainFeatures &&
                expert.blockchain?.isActive &&
                balance &&
                !canAfford && (
                  <div className={styles.purchaseButtonWrapper}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                        e?.preventDefault();
                        handlePurchaseClick(expert);
                      }}
                    >
                      Buy {expert.token || `BT${expert.slug.toUpperCase()}`} tokens
                    </Button>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Token purchase dialog */}
      <Dialog
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        title={`Buy ${purchaseExpert?.token || purchaseExpert?.slug} tokens`}
        description={`Purchase tokens for consultation with ${purchaseExpert?.name}`}
      >
        {purchaseExpert && (
          <TokenPurchase
            expert={{
              name: purchaseExpert.name,
              symbol: purchaseExpert.token || purchaseExpert.slug,
              category: purchaseExpert.fund || 'Investment Expert',
              tokensPerQuery: purchaseExpert.tokensPerQuery || 10,
              isActive: true,
              tokenAddress: purchaseExpert.blockchain?.tokenAddress || '',
              expertAddress: purchaseExpert.blockchain?.tokenAddress || '',
              totalConsultations: 0,
              totalRevenue: 0,
            }}
            onPurchaseSuccess={handlePurchaseSuccess}
            onPurchaseError={handlePurchaseError}
          />
        )}
      </Dialog>
    </div>
  );
}
