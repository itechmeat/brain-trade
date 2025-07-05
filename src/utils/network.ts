/**
 * Network utilities for blockchain interactions
 */

import { DEFAULT_NETWORK } from '@/lib/blockchain/config';

interface WalletProvider {
  send: (method: string, params: unknown[]) => Promise<unknown>;
}

/**
 * Check if provider supports wallet_* methods
 */
export function hasProviderSend(provider: unknown): provider is WalletProvider {
  return typeof provider === 'object' && provider !== null && 'send' in provider;
}

/**
 * Switch to the correct network automatically
 */
export async function switchToCorrectNetwork(provider: WalletProvider): Promise<boolean> {
  if (!hasProviderSend(provider)) {
    return false;
  }

  try {
    // Try to switch to the correct network
    await provider.send('wallet_switchEthereumChain', [
      { chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}` },
    ]);
    return true;
  } catch (switchError: unknown) {
    const error = switchError as { code?: number; message?: string };
    if (error.code === 4902) {
      // Network not added, add it
      try {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}`,
            chainName: DEFAULT_NETWORK.name,
            rpcUrls: [DEFAULT_NETWORK.rpcUrl],
            blockExplorerUrls: [DEFAULT_NETWORK.blockExplorer],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ]);
        return true;
      } catch (addError) {
        console.warn('Failed to add network:', addError);
        return false;
      }
    } else {
      console.warn('Auto network switch failed:', switchError);
      return false;
    }
  }
}

/**
 * Check if current network is correct
 */
export function isCorrectNetwork(chainId: number): boolean {
  return chainId === DEFAULT_NETWORK.chainId;
}
