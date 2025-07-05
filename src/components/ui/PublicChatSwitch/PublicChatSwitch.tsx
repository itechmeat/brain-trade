import React, { useState } from 'react';
import { CopyIcon } from '@radix-ui/react-icons';
import { Switch } from '@/components/ui/Switch/Switch';
import { useToastContext } from '@/providers/ToastProvider';
import styles from './PublicChatSwitch.module.scss';

interface PublicChatSwitchProps {
  expertSlug: string;
  chatId: string;
  className?: string;
}

export function PublicChatSwitch({ expertSlug, chatId, className }: PublicChatSwitchProps) {
  const [isPublic, setIsPublic] = useState(false);
  const { showToast } = useToastContext();

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/chat/${expertSlug}/${chatId}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast({
        description: 'Public chat link copied to clipboard',
        duration: 5000,
      });
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      showToast({
        description: 'Public chat link copied to clipboard',
        duration: 5000,
      });
    }
  };

  return (
    <div className={`${styles.publicChatSwitch} ${className || ''}`}>
      <div className={styles.switchContainer}>
        {!isPublic && (
          <label htmlFor="public-chat-switch" className={styles.label}>
            Public Chat
          </label>
        )}

        {isPublic && (
          <button
            onClick={handleCopyLink}
            className={styles.copyButton}
            type="button"
            aria-label="Copy public link"
          >
            <CopyIcon className={styles.copyIcon} />
            <span>Copy public link</span>
          </button>
        )}

        <Switch id="public-chat-switch" checked={isPublic} onCheckedChange={setIsPublic} />
      </div>
    </div>
  );
}
