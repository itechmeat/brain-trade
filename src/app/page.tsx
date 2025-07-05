'use client';

import React, { useState, useEffect } from 'react';
import { MarketplaceExpertSelector } from '@/components/experts';
import { AuthButton } from '@/components/auth';
import investmentExperts from '@/data/investment_experts.json';
import type { InvestmentExpert } from '@/types/expert';
import styles from './page.module.scss';

export default function Home() {
  const [experts, setExperts] = useState<InvestmentExpert[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading experts from blockchain
  useEffect(() => {
    const loadExperts = async () => {
      setLoading(true);
      // Simulate blockchain loading delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExperts(investmentExperts as InvestmentExpert[]);
      setLoading(false);
    };

    loadExperts();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>BrainTrade</h1>
              <p className={styles.subtitle}>Tokenized Expert Consultations</p>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <MarketplaceExpertSelector experts={experts} loading={loading} />
      </main>
    </div>
  );
}
