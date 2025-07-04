import React from 'react';
import styles from './BottomNavigation.module.scss';

interface BottomNavigationProps {
  onShowDocument: () => void;
  onToggleSession: () => void;
  onShowExperts: () => void;
  hasUnreadDocument?: boolean;
  isSessionStopped?: boolean;
  className?: string;
}

/**
 * Bottom navigation component for mobile interface
 * @param onShowDocument - Callback to show document modal
 * @param onToggleSession - Callback to stop/resume session
 * @param onShowExperts - Callback to show experts panel
 * @param hasUnreadDocument - Whether document has unread changes
 * @param isSessionStopped - Whether session is currently stopped
 * @param className - Additional CSS classes
 */
export function BottomNavigation({
  onShowDocument,
  onToggleSession,
  onShowExperts,
  hasUnreadDocument = false,
  isSessionStopped = false,
  className = '',
}: BottomNavigationProps) {
  return (
    <div className={`${styles.bottomNav} ${className}`}>
      <div className={styles.navItems}>
        {/* Document Button */}
        <button onClick={onShowDocument} className={styles.navButton} aria-label="Show document">
          <div className={styles.iconWrapper}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            {hasUnreadDocument && <span className={styles.unreadDot} />}
          </div>
          <span className={styles.label}>Document</span>
        </button>

        {/* Session Control Button */}
        <button
          onClick={onToggleSession}
          className={`${styles.navButton} ${isSessionStopped ? styles.resumeButton : styles.stopButton}`}
          aria-label={isSessionStopped ? 'Resume session' : 'Stop session'}
        >
          <div className={styles.iconWrapper}>
            {isSessionStopped ? (
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            ) : (
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </div>
          <span className={styles.label}>{isSessionStopped ? 'Resume' : 'Stop'}</span>
        </button>

        {/* Experts Button */}
        <button onClick={onShowExperts} className={styles.navButton} aria-label="Show experts">
          <div className={styles.iconWrapper}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className={styles.label}>Experts</span>
        </button>
      </div>
    </div>
  );
}
