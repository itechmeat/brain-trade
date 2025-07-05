'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MarketplaceTokenizedChatInterface } from '@/components/chat/MarketplaceTokenizedChatInterface/MarketplaceTokenizedChatInterface';
import { LoadingSpinner } from '@/components/ui';
import { AuthButton } from '@/components/auth';
import { useContracts } from '@/hooks/useContracts';
import { createMarketplaceExpert } from '@/lib/marketplace-adapter';
import type { MarketplaceExpert } from '@/types/marketplace';
import type { InvestmentExpert } from '@/types/expert';
import investmentExperts from '@/data/investment_experts.json';
import styles from './page.module.scss';

interface MarketplaceChatPageProps {
  params: Promise<{
    expert: string;
    id: string;
  }>;
}

export default function MarketplaceChatPage({ params }: MarketplaceChatPageProps) {
  const [expertSlug, setExpertSlug] = useState<string>('');
  const [, setChatId] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<MarketplaceExpert | null>(null);
  const { loadExperts, isReady } = useContracts();

  // Extract params
  useEffect(() => {
    params.then(({ expert, id }) => {
      setExpertSlug(expert);
      setChatId(id);
    });
  }, [params]);

  // Load experts if needed
  useEffect(() => {
    if (isReady) {
      loadExperts();
    }
  }, [isReady, loadExperts]);

  // Find and set selected expert
  useEffect(() => {
    if (expertSlug) {
      const investmentExpert = investmentExperts.find(
        e => e.slug === expertSlug,
      ) as InvestmentExpert;
      if (investmentExpert) {
        const marketplaceExpert = createMarketplaceExpert(investmentExpert);
        setSelectedExpert(marketplaceExpert);
      }
    }
  }, [expertSlug]);

  if (!selectedExpert) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <Link href="/" className={styles.titleLink}>
                <h1 className={styles.title}>BrainTrade</h1>
                <p className={styles.subtitle}>Tokenized Expert Consultations</p>
              </Link>
              <AuthButton />
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <LoadingSpinner
            title="Loading Expert Chat"
            subtitle="Connecting to blockchain and loading expert profile..."
          />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.titleLink}>
              <h1 className={styles.title}>BrainTrade</h1>
              <p className={styles.subtitle}>Tokenized Expert Consultations</p>
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <MarketplaceTokenizedChatInterface selectedExpert={selectedExpert} />
      </main>
    </div>
  );
}
