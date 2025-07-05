/**
 * Simple Message Input Component
 *
 * Simplified component for message input in tokenized chat
 */

import React, { useState, useRef } from 'react';
import { Button, Textarea } from '@/components/ui';
import styles from './SimpleMessageInput.module.scss';

interface SimpleMessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}

export function SimpleMessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Write your message...',
  loading = false,
}: SimpleMessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || disabled || sending) return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');

      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = disabled || sending || loading;

  return (
    <div className={styles.messageInput}>
      <div className={styles.inputWrapper}>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          disabled={isDisabled}
          className={styles.textarea}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isDisabled}
          loading={sending}
          className={styles.sendButton}
        >
          Send
        </Button>
      </div>
      <div className={styles.hint}>
        {isDisabled ? (loading ? 'Processing...' : 'Unavailable') : 'Press Cmd+Enter to send'}
      </div>
    </div>
  );
}
