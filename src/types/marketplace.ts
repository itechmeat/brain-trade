/**
 * Marketplace Types
 *
 * Types for integrating blockchain functionality into the main page.
 * Contains adapters between InvestmentExpert and ExpertInfo types.
 */

import { InvestmentExpert } from './expert';
import { ExpertInfo, TokenBalance, ConsultationSession } from './contracts';
import { ChatSession } from './chat';

// ============================================================================
// Marketplace Expert Types
// ============================================================================

/**
 * Extended expert type for marketplace with blockchain data
 */
export interface MarketplaceExpert extends InvestmentExpert {
  /** Blockchain information */
  blockchain?: {
    /** Expert token address */
    tokenAddress: string;
    /** Whether token is active */
    isActive: boolean;
    /** User token balance */
    userBalance?: TokenBalance;
    /** Whether balance is loading */
    balanceLoading?: boolean;
  };
}

/**
 * Blockchain connection status for marketplace
 */
export type MarketplaceConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wrong-network'
  | 'error';

/**
 * Marketplace blockchain connection state
 */
export interface MarketplaceConnectionState {
  status: MarketplaceConnectionStatus;
  isReady: boolean;
  isCorrectChain: boolean;
  userAddress?: string;
  error?: string;
}

// ============================================================================
// Marketplace Chat Types
// ============================================================================

/**
 * Chat type for marketplace (extended ChatSession)
 */
export interface MarketplaceChatSession extends ChatSession {
  /** Blockchain information */
  blockchain?: {
    /** Related consultations */
    consultations: ConsultationSession[];
    /** Total cost in tokens */
    totalTokensCost: bigint;
    /** Blockchain operations status */
    blockchainStatus: 'pending' | 'confirmed' | 'failed';
  };
}

/**
 * Parameters for creating marketplace chat
 */
export interface MarketplaceChatParams {
  expertSlug: string;
  expertSymbol: string;
  initialMessage?: string;
  isTokenized: boolean;
}

// ============================================================================
// Marketplace UI Types
// ============================================================================

/**
 * Props for marketplace components
 */
export interface MarketplaceComponentProps {
  /** CSS classes */
  className?: string;
  /** Whether to show blockchain information */
  showBlockchainInfo?: boolean;
  /** Callback for error handling */
  onError?: (error: string) => void;
}

/**
 * Marketplace UI state
 */
export interface MarketplaceUIState {
  /** Selected expert */
  selectedExpert: MarketplaceExpert | null;
  /** Whether to show token purchase modal */
  showPurchaseModal: boolean;
  /** Whether to show expert details */
  showExpertDetails: boolean;
  /** Whether something is loading */
  loading: boolean;
  /** Error message */
  error: string | null;
}

// ============================================================================
// Marketplace API Types
// ============================================================================

/**
 * Marketplace API request
 */
export interface MarketplaceAPIRequest {
  /** Request type */
  type: 'expert-select' | 'chat-start' | 'token-purchase' | 'consultation-complete';
  /** Request parameters */
  params: Record<string, unknown>;
  /** Blockchain data */
  blockchain?: {
    userAddress: string;
    transactionHash?: string;
    expertSymbol: string;
  };
}

/**
 * Marketplace API response
 */
export interface MarketplaceAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  blockchain?: {
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: bigint;
  };
}

// ============================================================================
// Adapter Types
// ============================================================================

/**
 * Adapter configuration for type conversion
 */
export interface AdapterConfig {
  /** Whether to include blockchain data */
  includeBlockchain: boolean;
  /** Whether to include user balances */
  includeUserBalances: boolean;
  /** User address for fetching balances */
  userAddress?: string;
}

/**
 * Expert conversion result
 */
export interface ExpertConversionResult {
  /** Converted expert */
  expert: ExpertInfo;
  /** Whether there were conversion errors */
  hasErrors: boolean;
  /** List of errors */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

/**
 * Field mapping between types
 */
export interface FieldMapping {
  /** Source field */
  source: keyof InvestmentExpert;
  /** Target field */
  target: keyof ExpertInfo;
  /** Transformation function */
  transform?: (value: unknown) => unknown;
  /** Whether field is required */
  required?: boolean;
}

// ============================================================================
// Marketplace Events
// ============================================================================

/**
 * Marketplace events
 */
export type MarketplaceEvent =
  | 'expert-selected'
  | 'chat-started'
  | 'token-purchased'
  | 'consultation-completed'
  | 'wallet-connected'
  | 'wallet-disconnected'
  | 'network-switched';

/**
 * Marketplace event data
 */
export interface MarketplaceEventData {
  event: MarketplaceEvent;
  timestamp: Date;
  data: Record<string, unknown>;
  blockchain?: {
    transactionHash?: string;
    blockNumber?: number;
  };
}

// ============================================================================
// Marketplace Hooks Types
// ============================================================================

/**
 * Return data from useMarketplaceTokenizedChat hook
 */
export interface MarketplaceTokenizedChatHook {
  // Chat state
  currentSession: MarketplaceChatSession | null;
  messages: MarketplaceChatSession['messages'];

  // Blockchain state
  connectionState: MarketplaceConnectionState;
  selectedExpert: MarketplaceExpert | null;
  tokenBalance: TokenBalance | null;
  canAffordConsultation: boolean;

  // Loading states
  loading: boolean;
  processingConsultation: boolean;

  // Error state
  error: string | null;

  // Actions
  selectExpert: (expert: MarketplaceExpert) => void;
  startTokenizedConsultation: (initialMessage: string) => Promise<MarketplaceChatSession>;
  sendTokenizedMessage: (content: string) => Promise<void>;
  loadTokenBalance: (forceRefresh?: boolean) => Promise<void>;
  clearSession: () => void;
}

/**
 * Return data from useMarketplaceContracts hook
 */
export interface MarketplaceContractsHook {
  // Connection state
  connectionState: MarketplaceConnectionState;

  // Experts data
  experts: MarketplaceExpert[];
  expertsLoading: boolean;

  // Blockchain operations
  loadExperts: () => Promise<void>;
  getTokenBalance: (expertSymbol: string, forceRefresh?: boolean) => Promise<TokenBalance | null>;
  startConsultation: (
    expertSymbol: string,
    consultationId: string,
  ) => Promise<{ success: boolean; transactionHash?: string; error?: string }>;
  purchaseTokens: (
    expertSymbol: string,
    amount: bigint,
  ) => Promise<{ success: boolean; transactionHash?: string; error?: string }>;

  // Network operations
  switchNetwork: () => Promise<boolean>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;

  // Utilities
  clearBalanceCache: () => void;
  refreshAllBalances: () => Promise<void>;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation schema for marketplace data
 */
export interface MarketplaceValidationSchema {
  expertSelection: {
    expertSlug: string;
    userAddress?: string;
  };

  chatStart: {
    expertSlug: string;
    expertSymbol: string;
    initialMessage: string;
    isTokenized: boolean;
    userAddress: string;
  };

  tokenPurchase: {
    expertSymbol: string;
    amount: string; // bigint as string
    userAddress: string;
  };

  consultationComplete: {
    consultationId: string;
    expertSymbol: string;
    userAddress: string;
    transactionHash: string;
  };
}

// All types are already exported via their declarations above
