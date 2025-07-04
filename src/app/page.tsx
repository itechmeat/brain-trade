'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExpertSelectionGrid } from '@/components/experts';
import { AuthButton } from '@/components/auth';
import investmentExperts from '@/data/investment_experts.json';
import type { InvestmentExpert } from '@/types/expert';
import styles from './page.module.scss';

export default function Home() {
  const router = useRouter();
  const experts = investmentExperts as InvestmentExpert[];

  const handleExpertSelect = (expertSlug: string) => {
    // Create a new chat session ID
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Navigate to expert chat
    router.push(`/chat/${expertSlug}/${chatId}`);
  };

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
          <p className={styles.description}>
            Select an expert and start a personal consultation on any topic
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <ExpertSelectionGrid
          experts={experts}
          onExpertSelect={handleExpertSelect}
          className={styles.expertGrid}
        />
      </main>
    </div>
  );
}
