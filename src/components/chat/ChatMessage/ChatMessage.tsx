import React from 'react';
import { ChatMessage as ChatMessageType, InvestmentExpert } from '@/types';
import { ExpertAvatar } from '@/components/experts/ExpertAvatar/ExpertAvatar';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
  expert?: InvestmentExpert;
  className?: string;
}

export function ChatMessage({ message, expert, className = '' }: ChatMessageProps) {
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

        <div className={styles.footer}>
          <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>

          {message.status === 'sending' && <span className={styles.status}>Sending...</span>}

          {message.status === 'error' && <span className={styles.status}>Send error</span>}
        </div>
      </div>
    </div>
  );
}
