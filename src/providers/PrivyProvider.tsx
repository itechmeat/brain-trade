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
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProviderCore>
  );
};
