import React from 'react';
import { InvestmentExpert } from '@/types';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { ExpertAvatar } from '../ExpertAvatar/ExpertAvatar';
import styles from './ExpertCard.module.scss';

interface ExpertCardProps {
  expert: InvestmentExpert;
  className?: string;
  variant?: 'compact' | 'detailed' | 'selection';
  selected?: boolean;
  onClick?: () => void;
}

export function ExpertCard({
  expert,
  className = '',
  variant = 'detailed',
  selected = false,
  onClick,
}: ExpertCardProps) {
  const cardClasses = [styles.expertCard, styles[variant], selected && styles.selected, className]
    .filter(Boolean)
    .join(' ');

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={cardClasses}
      variant="outlined"
      padding="md"
      onClick={variant === 'selection' ? undefined : handleCardClick}
      hover={!!onClick && variant !== 'selection'}
    >
      <div className={styles.header}>
        <ExpertAvatar expert={expert} size={variant === 'compact' ? 'md' : 'lg'} showName={false} />
        <div className={styles.basicInfo}>
          <h3 className={styles.name}>{expert.name.replace(' (RAG)', '')}</h3>
          {expert.token && (
            <div className={styles.tokenInfo}>
              <span className={styles.token}>${expert.token}</span>
              {expert.costPerQuery && (
                <span className={styles.cost}>${expert.costPerQuery.toFixed(4)}/query</span>
              )}
            </div>
          )}
          <p className={styles.fund}>{expert.fund}</p>
          {expert.description && variant !== 'compact' && (
            <p className={styles.description}>{expert.description}</p>
          )}
        </div>
      </div>

      {variant === 'selection' && (
        <div className={styles.selectionActions}>
          <Button
            onClick={handleCardClick}
            variant="primary"
            size="lg"
            className={styles.startChatButton}
          >
            Start Chat
          </Button>
        </div>
      )}

      {variant === 'detailed' && (
        <div className={styles.details}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Expertise</h4>
            <p className={styles.sectionContent}>{expert.expertise}</p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Focus</h4>
            <p className={styles.sectionContent}>{expert.focus}</p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Methodology</h4>
            <p className={styles.sectionContent}>{expert.methodology}</p>
          </div>

          {(expert.website || expert.twitter) && (
            <div className={styles.links}>
              {expert.website && (
                <a
                  href={expert.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                  onClick={e => e.stopPropagation()}
                >
                  Website
                </a>
              )}
              {expert.twitter && (
                <a
                  href={`https://twitter.com/${expert.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                  onClick={e => e.stopPropagation()}
                >
                  Twitter
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
