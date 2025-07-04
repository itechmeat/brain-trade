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
  className?: string;
  isLoading?: boolean;
}

export function ChatInterface({
  session,
  experts,
  onSendMessage,
  className = '',
  isLoading = false,
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
            />
          ))}

          {isLoading && (
            <div className={styles.loadingIndicator}>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Expert is responding...</span>
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
            placeholder="Ask the expert a question..."
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
