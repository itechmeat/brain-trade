import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { DocumentViewer } from '../DocumentViewer/DocumentViewer';
import styles from './DocumentModal.module.scss';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: string;
  title: string;
  hasUnreadChanges?: boolean;
}

/**
 * Full-screen modal for displaying project document on mobile devices
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 * @param document - Document content to display
 * @param title - Document title
 * @param hasUnreadChanges - Whether document has unread changes
 */
export function DocumentModal({
  isOpen,
  onClose,
  document: documentContent,
  title,
}: DocumentModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    const bodyStyle = document.body.style;
    if (isOpen) {
      bodyStyle.overflow = 'hidden';
      bodyStyle.height = '100%';
    } else {
      bodyStyle.overflow = '';
      bodyStyle.height = '';
    }

    return () => {
      bodyStyle.overflow = '';
      bodyStyle.height = '';
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
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className={styles.closeButton}
          aria-label="Close document"
        >
          ✕
        </Button>

        {/* Document Content */}
        <div className={styles.content}>
          <DocumentViewer
            document={documentContent}
            title={title}
            className={styles.documentViewer}
          />
        </div>
      </div>
    </div>
  );
}
