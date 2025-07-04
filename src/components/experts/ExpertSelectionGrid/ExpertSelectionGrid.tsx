import React from 'react';
import { InvestmentExpert } from '@/types';
import { ExpertCard } from '../ExpertCard/ExpertCard';
import styles from './ExpertSelectionGrid.module.scss';

interface ExpertSelectionGridProps {
  experts: InvestmentExpert[];
  onExpertSelect: (expertSlug: string) => void;
  className?: string;
}

/**
 * Mobile-first grid component for expert selection
 * @param experts - Array of available experts
 * @param onExpertSelect - Callback when expert is selected
 * @param className - Additional CSS classes
 */
export function ExpertSelectionGrid({
  experts,
  onExpertSelect,
  className = '',
}: ExpertSelectionGridProps) {
  const handleExpertClick = (expert: InvestmentExpert) => {
    onExpertSelect(expert.slug);
  };

  return (
    <div className={`${styles.grid} ${className}`}>
      {experts.map((expert) => (
        <div key={expert.slug} className={styles.gridItem}>
          <ExpertCard
            expert={expert}
            variant="selection"
            onClick={() => handleExpertClick(expert)}
            className={styles.expertCard}
          />
        </div>
      ))}
    </div>
  );
}