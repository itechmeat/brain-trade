/**
 * Tokenized Chat Page
 *
 * Main page for tokenized chat.
 * Combines expert selection and tokenized communication.
 */

'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ExpertInfo } from '@/types/contracts';
import { ExpertSelector } from '@/components/experts/ExpertSelector';
import { TokenizedChatInterface } from '@/components/chat/TokenizedChatInterface';
import { Button } from '@/components/ui';
import styles from './page.module.scss';

/**
 * Main page for tokenized chat
 *
 * Workflow:
 * 1. User selects expert
 * 2. Token balance is checked
 * 3. If enough tokens - chat begins
 * 4. When sending message, tokens are deducted
 * 5. AI generates response on behalf of expert
 * 6. Revenue is distributed between expert and platform
 */
export default function TokenizedChatPage() {
  const [selectedExpert, setSelectedExpert] = useState<ExpertInfo | null>(null);
  const [showExpertSelector, setShowExpertSelector] = useState(true);

  // Privy hooks
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  /**
   * Handle expert selection
   */
  const handleExpertSelect = (expert: ExpertInfo) => {
    setSelectedExpert(expert);
    setShowExpertSelector(false);
  };

  /**
   * Return to expert selection
   */
  const handleBackToSelector = () => {
    setShowExpertSelector(true);
    setSelectedExpert(null);
  };

  return (
    <div className={styles.tokenizedChatPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {/* Wallet connection */}
          <div className={styles.walletConnection}>
            {!ready ? (
              <Button disabled>Loading...</Button>
            ) : !authenticated ? (
              <Button onClick={login}>Connect Wallet</Button>
            ) : (
              <div className={styles.walletInfo}>
                <span>Wallet: {wallets[0]?.walletClientType || 'Connected'}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Switch Wallet
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {showExpertSelector ? (
          // Expert selection
          <div className={styles.expertSelectionSection}>
            <div className={styles.expertSelectorContainer}>
              <ExpertSelector
                selectedExpert={selectedExpert}
                onExpertSelect={handleExpertSelect}
                showTokenInfo={true}
              />
            </div>
          </div>
        ) : (
          // Tokenized chat
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSelector}
                className={styles.backButton}
              >
                ← Change Expert
              </Button>

              <div className={styles.currentExpert}>
                <h2>Consultation with {selectedExpert?.name}</h2>
                <p>{selectedExpert?.category}</p>
              </div>
            </div>

            <div className={styles.chatContainer}>
              <TokenizedChatInterface
                selectedExpert={selectedExpert}
                onExpertChange={setSelectedExpert}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
