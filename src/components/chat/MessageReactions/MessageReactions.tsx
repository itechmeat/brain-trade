import React from 'react';
import styles from './MessageReactions.module.scss';

interface MessageReactionsProps {
  messageId: string;
  currentReaction?: 'like' | 'dislike' | null;
  onReaction: (messageId: string, reaction: 'like' | 'dislike' | null) => void;
  hasRecommendations?: boolean;
  selectedRecommendationsCount?: number;
  isApplyingRecommendations?: boolean;
  onApplyRecommendations?: (messageId: string) => void;
  className?: string;
}

export function MessageReactions({
  messageId,
  currentReaction,
  onReaction,
  hasRecommendations = false,
  selectedRecommendationsCount = 0,
  isApplyingRecommendations = false,
  onApplyRecommendations,
  className = '',
}: MessageReactionsProps) {
  const handleLike = () => {
    const newReaction = currentReaction === 'like' ? null : 'like';
    onReaction(messageId, newReaction);
  };

  const handleDislike = () => {
    const newReaction = currentReaction === 'dislike' ? null : 'dislike';
    onReaction(messageId, newReaction);
  };

  const handleApplyRecommendations = () => {
    if (onApplyRecommendations) {
      onApplyRecommendations(messageId);
    }
  };

  return (
    <div className={`${styles.messageReactions} ${className}`}>
      <div className={styles.reactionButtons}>
        <button
          onClick={handleLike}
          className={`${styles.reactionButton} ${styles.likeButton} ${
            currentReaction === 'like' ? styles.active : ''
          }`}
          title="Like this message"
        >
          👍
        </button>
        <button
          onClick={handleDislike}
          className={`${styles.reactionButton} ${styles.dislikeButton} ${
            currentReaction === 'dislike' ? styles.active : ''
          }`}
          title="Dislike this message"
        >
          👎
        </button>
      </div>

      {hasRecommendations && onApplyRecommendations && (
        <button
          onClick={handleApplyRecommendations}
          disabled={selectedRecommendationsCount === 0 || isApplyingRecommendations}
          className={`${styles.applyButton} ${selectedRecommendationsCount === 0 || isApplyingRecommendations ? styles.disabled : ''}`}
          title={
            isApplyingRecommendations
              ? 'Applying recommendations...'
              : selectedRecommendationsCount === 0
                ? 'Select at least one recommendation to apply'
                : 'Apply selected recommendations to project document'
          }
        >
          {isApplyingRecommendations
            ? '⏳ Applying...'
            : `✨ Apply ${selectedRecommendationsCount > 0 ? `(${selectedRecommendationsCount})` : 'Recommendations'}`}
        </button>
      )}
    </div>
  );
}
