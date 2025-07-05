'use client';

import { PrivyProvider as PrivyProviderCore } from '@privy-io/react-auth';
import { type ReactNode } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

/**
 * Client-side wrapper for Privy.io authentication provider
 * Ensures proper client-side only rendering
 */
export const PrivyProvider = ({ children }: PrivyProviderProps) => {
  return (
    <PrivyProviderCore
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        // Force create embedded wallets for all users
        embeddedWallets: {
          createOnLogin: 'all-users', // Create for all users, including those with MetaMask
          showWalletUIs: false, // Disable confirmation modals for automatic signing
        },

        // Automatic network connection
        defaultChain: {
          id: 48898, // Zircuit testnet
          name: 'Zircuit Testnet',
          network: 'zircuit-testnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: [
                process.env.NEXT_PUBLIC_ZIRCUIT_RPC_URL ||
                  'https://zircuit-garfield-testnet.drpc.org',
              ],
            },
          },
          blockExplorers: {
            default: {
              name: 'Zircuit Explorer',
              url: 'https://explorer.zircuit.com',
            },
          },
        },
        supportedChains: [
          {
            id: 48898, // Zircuit testnet
            name: 'Zircuit Testnet',
            network: 'zircuit-testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: [
                  process.env.NEXT_PUBLIC_ZIRCUIT_RPC_URL ||
                    'https://zircuit-garfield-testnet.drpc.org',
                ],
              },
            },
            blockExplorers: {
              default: {
                name: 'Zircuit Explorer',
                url: 'https://explorer.zircuit.com',
              },
            },
          },
        ],
        // Settings for automatic switching
        loginMethods: ['email', 'wallet'],
        // Disable wallet switching prompts
        appearance: {
          walletList: ['metamask', 'coinbase_wallet', 'wallet_connect'],
          showWalletLoginFirst: false,
          theme: 'light',
        },
      }}
    >
      {children}
    </PrivyProviderCore>
  );
};
