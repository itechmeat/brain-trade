/**
 * Wallet utilities for Privy integration
 */

import { ConnectedWallet } from '@privy-io/react-auth';

/**
 * Get embedded wallet from wallets array, prioritizing it for automatic signing
 */
export function getEmbeddedWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  // Find embedded wallet (created by Privy)
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  if (embeddedWallet) {
    console.log('✅ Using embedded wallet for automatic signing');
    return embeddedWallet;
  }

  console.warn('⚠️ No embedded wallet found, using first available wallet');
  console.warn('⚠️ This may trigger MetaMask confirmations');

  return wallets[0] || null;
}

/**
 * Check if user has embedded wallet
 */
export function hasEmbeddedWallet(wallets: ConnectedWallet[]): boolean {
  return wallets.some(wallet => wallet.walletClientType === 'privy');
}

/**
 * Get wallet type description
 */
export function getWalletTypeDescription(wallet: ConnectedWallet): string {
  switch (wallet.walletClientType) {
    case 'privy':
      return 'Embedded Wallet (Auto-sign enabled)';
    case 'metamask':
      return 'MetaMask (Manual confirmation required)';
    case 'coinbase_wallet':
      return 'Coinbase Wallet (Manual confirmation required)';
    case 'wallet_connect':
      return 'WalletConnect (Manual confirmation required)';
    default:
      return `${wallet.walletClientType} (Manual confirmation required)`;
  }
}
