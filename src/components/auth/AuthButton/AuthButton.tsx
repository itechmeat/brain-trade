import { usePrivy } from '@privy-io/react-auth';
import { ExitIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui';
import styles from './AuthButton.module.scss';

/**
 * Authentication button component that handles login/logout
 * Uses Privy.io authentication service
 */
export const AuthButton = () => {
  const { login, logout, ready, authenticated, user } = usePrivy();

  /**
   * Truncates wallet address to more compact format
   */
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    const address = user?.email?.address || user?.wallet?.address || '';

    return (
      <div className={styles.authContainer}>
        <span className={styles.userInfo}>{formatAddress(address)}</span>
        <button onClick={logout} className={styles.logoutButton} aria-label="Logout">
          <ExitIcon />
        </button>
      </div>
    );
  }

  return (
    <Button onClick={login} variant="primary">
      Login
    </Button>
  );
};
