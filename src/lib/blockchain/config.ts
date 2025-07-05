/**
 * Blockchain configuration for BrainTrade
 *
 * This file contains network configurations, contract addresses,
 * and settings for blockchain interactions.
 */

import { NetworkConfig } from '@/types/contracts';

/**
 * Zircuit testnet configuration
 */
export const ZIRCUIT_TESTNET: NetworkConfig = {
  chainId: 48898, // 0xbf02 in hex
  name: 'Zircuit Testnet',
  rpcUrl:
    process.env.NEXT_PUBLIC_ZIRCUIT_RPC_URL ||
    process.env.ZIRCUIT_RPC_URL ||
    'https://zircuit-garfield-testnet.drpc.org',
  blockExplorer: 'https://explorer.zircuit.com',
  contracts: {
    // These will be set after deployment
    expertFactory: process.env.NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS || '',
  },
};

/**
 * Supported networks
 */
export const SUPPORTED_NETWORKS = {
  zircuitTestnet: ZIRCUIT_TESTNET,
} as const;

/**
 * Default network for the application
 */
export const DEFAULT_NETWORK = ZIRCUIT_TESTNET;

/**
 * Contract deployment configuration
 * Used for initial expert creation
 */
export const INITIAL_EXPERTS_CONFIG = [
  {
    name: 'Ben Horowitz',
    symbol: 'btBEN',
    category: 'Venture Capital',
    tokensPerQuery: 15,
    expertAddress: '0x0000000000000000000000000000000000000001', // Placeholder
  },
  {
    name: 'Peter Thiel',
    symbol: 'btTHIEL',
    category: 'Venture Capital',
    tokensPerQuery: 20,
    expertAddress: '0x0000000000000000000000000000000000000002', // Placeholder
  },
  {
    name: 'Steve Blank',
    symbol: 'btBLANK',
    category: 'Lean Startup',
    tokensPerQuery: 10,
    expertAddress: '0x0000000000000000000000000000000000000003', // Placeholder
  },
] as const;

/**
 * Gas price settings for transactions
 */
export const GAS_SETTINGS = {
  // Gas limit for different operations
  limits: {
    expertCreation: BigInt(500000),
    tokenPurchase: BigInt(100000),
    consultation: BigInt(150000),
    tokenTransfer: BigInt(50000),
  },

  // Gas price multiplier (for faster confirmation)
  multiplier: 1.2,
} as const;

/**
 * Token display settings
 */
export const TOKEN_SETTINGS = {
  // Number of decimal places to show
  displayDecimals: 2,

  // Minimum balance to show (in wei)
  minimumDisplay: BigInt('1000000000000000'), // 0.001 ETH

  // Default token amounts for purchase suggestions (with 18 decimals)
  purchaseSuggestions: [
    { label: '100 tokens', amount: BigInt(100) * BigInt(10) ** BigInt(18) },
    { label: '500 tokens', amount: BigInt(500) * BigInt(10) ** BigInt(18) },
    { label: '1000 tokens', amount: BigInt(1000) * BigInt(10) ** BigInt(18) },
    { label: '5000 tokens', amount: BigInt(5000) * BigInt(10) ** BigInt(18) },
  ],
} as const;

/**
 * Application constants
 */
export const APP_CONSTANTS = {
  // Platform fee percentage (10%)
  platformFeePercent: 10,

  // Initial token supply for each expert (1M tokens)
  initialTokenSupply: BigInt(1000000),

  // Consultation ID generation
  consultationIdPrefix: 'consult_',

  // Transaction confirmation blocks
  confirmationBlocks: 2,
} as const;

/**
 * Error messages for blockchain interactions
 */
export const BLOCKCHAIN_ERRORS = {
  networkMismatch: 'Please switch to Zircuit Testnet',
  insufficientBalance: 'Insufficient ETH balance for transaction',
  insufficientTokens: 'Insufficient expert tokens for consultation',
  transactionFailed: 'Transaction failed. Please try again.',
  contractNotFound: 'Contract not found or not deployed',
  expertNotFound: 'Expert not found',
  expertInactive: 'Expert is currently inactive',
  invalidAmount: 'Invalid token amount',
  userRejected: 'Transaction rejected by user',
} as const;

/**
 * Success messages
 */
export const BLOCKCHAIN_SUCCESS = {
  tokensPurchased: 'Expert tokens purchased successfully!',
  consultationStarted: 'Consultation started successfully!',
  consultationCompleted: 'Consultation completed!',
  expertCreated: 'Expert created successfully!',
} as const;

/**
 * Development/testing configuration
 */
export const DEV_CONFIG = {
  // Skip certain validations in development
  skipNetworkCheck: process.env.NODE_ENV === 'development',

  // Use mock contracts if no addresses provided
  useMockContracts: !process.env.NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS,

  // Enable detailed logging
  verboseLogging: process.env.NODE_ENV === 'development',
} as const;

/**
 * Utility function to check if we're on the correct network
 */
export function isCorrectNetwork(chainId: number): boolean {
  return chainId === DEFAULT_NETWORK.chainId;
}

/**
 * Utility function to format token amounts for display
 */
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.replace(/0+$/, '');

  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

/**
 * Utility function to parse token amounts from user input
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFraction);
}
