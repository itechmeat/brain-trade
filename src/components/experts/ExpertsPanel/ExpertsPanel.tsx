import React, { useEffect } from 'react';
import { InvestmentExpert } from '@/types';
import { ExpertAvatar } from '../ExpertAvatar/ExpertAvatar';
import { Button } from '@/components/ui/Button/Button';
import styles from './ExpertsPanel.module.scss';

interface ExpertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  experts: InvestmentExpert[];
  activeExperts: string[];
  className?: string;
}

/**
 * Side panel displaying investment experts for mobile interface
 * @param isOpen - Whether the panel is currently open
 * @param onClose - Callback to close the panel
 * @param experts - All available experts
 * @param activeExperts - Currently active expert slugs
 * @param className - Additional CSS classes
 */
export function ExpertsPanel({
  isOpen,
  onClose,
  experts,
  activeExperts,
  className = '',
}: ExpertsPanelProps) {
  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeExpertsList = experts.filter(expert => activeExperts.includes(expert.slug));
  const assistantExpert = experts.find(expert => expert.slug === 'assistant');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.panel} ${className}`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Investment Experts</h3>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className={styles.closeButton}
            aria-label="Close experts panel"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Assistant Section */}
          {assistantExpert && (
            <div className={styles.assistantSection}>
              <h4 className={styles.sectionTitle}>AI Assistant</h4>
              <div className={styles.expertsList}>
                <div className={styles.expertItem}>
                  <ExpertAvatar expert={assistantExpert} size="md" showName={false} />
                  <div className={styles.expertInfo}>
                    <h5 className={styles.expertName}>
                      {assistantExpert.name} ({assistantExpert.slug})
                    </h5>
                    <p className={styles.expertRole}>{assistantExpert.fund}</p>
                    <p className={styles.expertDescription}>{assistantExpert.expertise}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Experts Section */}
          <div className={styles.activeSection}>
            <h4 className={styles.sectionTitle}>Investment Experts ({activeExpertsList.length})</h4>
            <div className={styles.expertsList}>
              {activeExpertsList.map(expert => (
                <div key={expert.slug} className={styles.expertItem}>
                  <ExpertAvatar expert={expert} size="md" showName={false} />
                  <div className={styles.expertInfo}>
                    <h5 className={styles.expertName}>
                      {expert.name} ({expert.slug})
                    </h5>
                    <p className={styles.expertRole}>{expert.fund}</p>
                    <p className={styles.expertDescription}>{expert.expertise}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
