import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, InvestmentExpert } from '@/types';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import styles from './ChatInterface.module.scss';

interface ChatInterfaceProps {
  session: ChatSession;
  experts: InvestmentExpert[];
  onSendMessage: (content: string) => void;
  onEndSession?: () => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike' | null) => void;
  onApplyRecommendations?: (messageId: string, selectedRecommendations: string[]) => void;
  onStopQueue?: () => void;
  onResumeQueue?: () => void;
  className?: string;
  isLoading?: boolean;
  isApplyingRecommendations?: boolean;
  currentSpeakers?: string[]; // slugs of currently responding experts
  isQueueStopped?: boolean;
}

export function ChatInterface({
  session,
  experts,
  onSendMessage,
  onReaction,
  onApplyRecommendations,
  className = '',
  isLoading = false,
  isApplyingRecommendations = false,
  currentSpeakers,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  // Scroll to bottom when loading state changes (expert starts typing)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isLoading) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');

    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getExpertById = (expertId: string) => {
    return experts.find(expert => expert.slug === expertId);
  };

  const getLoadingMessage = () => {
    if (currentSpeakers && currentSpeakers.length > 0) {
      // Check if assistant is responding
      if (currentSpeakers.includes('assistant')) {
        return 'Assistant is updating the document';
      }

      const expertNames = currentSpeakers
        .map(slug => {
          const expert = getExpertById(slug);
          return expert ? expert.name.replace(' (RAG)', '') : null;
        })
        .filter(Boolean);

      if (expertNames.length === 1) {
        return `${expertNames[0]} is responding`;
      } else if (expertNames.length === 2) {
        return `${expertNames[0]} and ${expertNames[1]} are responding`;
      } else if (expertNames.length > 2) {
        const lastExpert = expertNames.pop();
        return `${expertNames.join(', ')}, and ${lastExpert} are responding`;
      }
    }
    return 'Expert is responding';
  };

  return (
    <div className={`${styles.chatInterface} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.sessionInfo}>
          <h2 className={styles.title}>{session.title}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        <div className={styles.messages}>
          {session.messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              expert={message.expertId ? getExpertById(message.expertId) : undefined}
              appliedRecommendations={session.appliedRecommendations || []}
              isApplyingRecommendations={isApplyingRecommendations}
              onReaction={onReaction}
              onApplyRecommendations={onApplyRecommendations}
            />
          ))}

          {isLoading && (
            <div className={styles.loadingIndicator}>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>{getLoadingMessage()}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask experts a question..."
            rows={3}
            disabled={false}
            className={styles.messageInput}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            Send
          </Button>
        </div>
        <div className={styles.inputHint}>Press Cmd+Enter to send</div>
      </div>
    </div>
  );
}
