import { useState, useEffect } from 'react';
import { ChatMessage as ChatMessageType, InvestmentExpert } from '@/types';
import { ExpertAvatar } from '@/components/experts';
import { MessageReactions } from '../MessageReactions/MessageReactions';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
  expert?: InvestmentExpert;
  appliedRecommendations?: string[]; // List of already applied recommendations
  isApplyingRecommendations?: boolean; // Whether recommendations are currently being applied
  className?: string;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike' | null) => void;
  onApplyRecommendations?: (messageId: string, selectedRecommendations: string[]) => void;
}

export function ChatMessage({
  message,
  expert,
  appliedRecommendations = [],
  isApplyingRecommendations = false,
  className = '',
  onReaction,
  onApplyRecommendations,
}: ChatMessageProps) {
  // Initialize selected recommendations - start with all non-applied recommendations selected
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(() => {
    if (message.metadata?.recommendations && message.metadata.recommendations.length > 0) {
      const newSelected = new Set<string>();
      message.metadata.recommendations.forEach(rec => {
        if (!appliedRecommendations.includes(rec)) {
          newSelected.add(rec);
        }
      });
      return newSelected;
    }
    return new Set<string>();
  });

  // Track which recommendations have been applied to permanently disable them
  const [localAppliedRecommendations, setLocalAppliedRecommendations] = useState<Set<string>>(
    () => new Set(appliedRecommendations),
  );

  // Update local applied recommendations when props change
  useEffect(() => {
    setLocalAppliedRecommendations(prev => {
      const newApplied = new Set(appliedRecommendations);

      // Remove newly applied recommendations from selection
      setSelectedRecommendations(prevSelected => {
        const newSelected = new Set(prevSelected);
        let changed = false;

        appliedRecommendations.forEach(appliedRec => {
          if (!prev.has(appliedRec) && newSelected.has(appliedRec)) {
            newSelected.delete(appliedRec);
            changed = true;
          }
        });

        return changed ? newSelected : prevSelected;
      });

      return newApplied;
    });
  }, [appliedRecommendations]);

  const handleRecommendationToggle = (recommendationText: string, checked: boolean) => {
    // Don't allow changes during loading or for applied recommendations
    if (isApplyingRecommendations || localAppliedRecommendations.has(recommendationText)) {
      return;
    }

    setSelectedRecommendations(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(recommendationText);
      } else {
        newSet.delete(recommendationText);
      }
      return newSet;
    });
  };

  const handleApplyRecommendations = () => {
    const selectedArray = Array.from(selectedRecommendations);
    if (onApplyRecommendations && selectedArray.length > 0) {
      // DO NOT modify selections during request - preserve user choices
      onApplyRecommendations(message.id, selectedArray);
    }
  };

  const selectedCount = selectedRecommendations.size;
  const messageClasses = [
    styles.chatMessage,
    styles[message.type],
    message.status === 'sending' && styles.sending,
    message.status === 'error' && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const formatTime = (timestamp: Date | string) => {
    // Convert string timestamps to Date objects
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if timestamp is valid
    if (!date || isNaN(date.getTime())) {
      return '--:--';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={messageClasses}>
      {message.type === 'expert' && expert && (
        <div className={styles.avatar}>
          <ExpertAvatar expert={expert} size="md" />
        </div>
      )}

      <div className={styles.content}>
        {message.type === 'expert' && expert && (
          <div className={styles.header}>
            <span className={styles.expertName}>
              {expert.name.replace(' (RAG)', '')} ({expert.slug})
            </span>
            <span className={styles.expertRole}>{expert.fund}</span>
          </div>
        )}

        {message.type === 'user' && (
          <div className={styles.header}>
            <span className={styles.userName}>You</span>
          </div>
        )}

        <div className={styles.messageContent}>{message.content}</div>

        {message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
          <div className={styles.recommendations}>
            <h4 className={styles.recommendationsTitle}>Recommendations:</h4>
            <div className={styles.recommendationsList}>
              {message.metadata.recommendations.map((recommendation, index) => {
                const isApplied = localAppliedRecommendations.has(recommendation);
                const isSelected = selectedRecommendations.has(recommendation);
                const isDisabled = isApplyingRecommendations || isApplied;
                const id = `${message.id}-rec-${index}`;

                return (
                  <div key={id} className={styles.recommendationItem}>
                    {isApplied ? (
                      // Show completed recommendation with checkmark emoji instead of checkbox
                      <div className={styles.completedRecommendation}>
                        <span className={styles.checkmark}>✅</span>
                        <span className={styles.completedText}>{recommendation}</span>
                      </div>
                    ) : (
                      // Show normal checkbox for non-applied recommendations
                      <Checkbox
                        id={id}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={checked => handleRecommendationToggle(recommendation, checked)}
                        label={recommendation}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>

          {message.status === 'sending' && <span className={styles.status}>Sending...</span>}

          {message.status === 'error' && <span className={styles.status}>Send error</span>}

          {message.metadata?.confidence && message.expertId !== 'assistant' && (
            <span className={styles.confidence}>
              Confidence: {Math.round(message.metadata.confidence)}%
            </span>
          )}

          {message.metadata?.investmentInterest && message.expertId !== 'assistant' && (
            <span className={styles.investmentInterest}>
              Investment Interest: {Math.round(message.metadata.investmentInterest)}%
            </span>
          )}
        </div>

        {message.type === 'expert' && message.expertId !== 'assistant' && onReaction && (
          <MessageReactions
            messageId={message.id}
            currentReaction={message.userReaction}
            onReaction={onReaction}
            hasRecommendations={
              !!(message.metadata?.recommendations && message.metadata.recommendations.length > 0)
            }
            selectedRecommendationsCount={selectedCount}
            isApplyingRecommendations={isApplyingRecommendations}
            onApplyRecommendations={handleApplyRecommendations}
          />
        )}
      </div>
    </div>
  );
}
