/**
 * TypeScript types for BrainTrade smart contracts
 *
 * These types provide full type safety when interacting with our contracts
 * from the frontend. They match the Solidity contract interfaces.
 */

/**
 * Expert information structure from ExpertFactory contract
 */
export interface ExpertInfo {
  tokenAddress: string; // Address of expert's ERC-20 token
  name: string; // Human readable name (e.g. "Peter Thiel")
  symbol: string; // Token symbol (e.g. "btTHIEL")
  category: string; // Expert category (e.g. "Venture Capital")
  tokensPerQuery: number; // Cost per consultation in tokens
  expertAddress: string; // Expert's wallet for revenue
  isActive: boolean; // Whether expert is active
  totalConsultations: number; // Total consultations count
  totalRevenue: number; // Total revenue generated
}

/**
 * Contract addresses for different networks
 */
export interface ContractAddresses {
  expertFactory: string;
  // Individual expert token addresses are retrieved dynamically
}

/**
 * Network configuration for blockchain interactions
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: ContractAddresses;
}

/**
 * Expert token contract interface
 * Represents individual ERC-20 tokens for each expert
 */
export interface ExpertTokenContract {
  // View functions
  name(): Promise<string>;
  symbol(): Promise<string>;
  totalSupply(): Promise<bigint>;
  balanceOf(account: string): Promise<bigint>;
  expertName(): Promise<string>;
  expertCategory(): Promise<string>;
  consultationCost(): Promise<bigint>;
  expertAddress(): Promise<string>;
  platformAddress(): Promise<string>;
  totalConsultations(): Promise<bigint>;
  totalRevenue(): Promise<bigint>;
  canAffordConsultation(user: string): Promise<boolean>;
  getExpertInfo(): Promise<{
    name_: string;
    category_: string;
    cost_: bigint;
    consultations_: bigint;
    revenue_: bigint;
  }>;

  // State-changing functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  purchaseTokens(amount: bigint, options?: { value: bigint }): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startConsultation(consultationId: bigint): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeConsultation(user: string, consultationId: bigint): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateConsultationCost(newCost: bigint): Promise<any>;

  // ERC-20 standard functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transfer(to: string, amount: bigint): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approve(spender: string, amount: bigint): Promise<any>;
  allowance(owner: string, spender: string): Promise<bigint>;
}

/**
 * Expert factory contract interface
 * Manages creation and registry of all expert tokens
 */
export interface ExpertFactoryContract {
  // View functions
  experts(symbol: string): Promise<ExpertInfo>;
  tokenToSymbol(tokenAddress: string): Promise<string>;
  expertSymbols(index: number): Promise<string>;
  platformAddress(): Promise<string>;
  getExpertCount(): Promise<bigint>;
  getExpert(symbol: string): Promise<ExpertInfo>;
  getExpertByToken(tokenAddress: string): Promise<ExpertInfo>;
  getAllExperts(): Promise<{
    symbols_: string[];
    tokenAddresses_: string[];
    names_: string[];
    categories_: string[];
    tokensPerQuery_: bigint[];
    isActive_: boolean[];
  }>;

  // State-changing functions (only owner)
  createExpert(
    name: string,
    symbol: string,
    category: string,
    tokensPerQuery: bigint,
    expertAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>;
  batchCreateExperts(
    names: string[],
    symbols: string[],
    categories: string[],
    tokensPerQuery: bigint[],
    expertAddresses: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateExpertCost(symbol: string, newTokensPerQuery: bigint): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setExpertActive(symbol: string, isActive: boolean): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePlatformAddress(newPlatformAddress: string): Promise<any>;
}

/**
 * Transaction receipt with additional context
 */
export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: bigint;
  status?: number;
  events?: unknown[];
}

/**
 * Contract interaction result
 */
export interface ContractCallResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  transaction?: TransactionResult;
}

/**
 * Token balance information
 */
export interface TokenBalance {
  symbol: string;
  name: string;
  balance: bigint;
  balanceFormatted: string;
  tokenAddress: string;
  canAffordConsultation: boolean;
}

/**
 * Consultation session
 */
export interface ConsultationSession {
  id: string;
  expertSymbol: string;
  userAddress: string;
  tokensCost: bigint;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  transactionHash: string;
}

/**
 * Expert creation parameters
 */
export interface CreateExpertParams {
  name: string;
  symbol: string;
  category: string;
  tokensPerQuery: number;
  expertAddress: string;
}

/**
 * Contract event data
 */
export interface ContractEvent {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: unknown[];
  timestamp: Date;
}

/**
 * Network constants
 */
export const ZIRCUIT_TESTNET: NetworkConfig = {
  chainId: 48898,
  name: 'Zircuit Testnet',
  rpcUrl: 'https://zircuit-garfield-testnet.drpc.org',
  blockExplorer: 'https://explorer.zircuit.com',
  contracts: {
    expertFactory: '', // Will be set after deployment
  },
};

/**
 * Contract ABIs (simplified for key functions)
 * Full ABIs would be generated from compiled contracts
 */
export const EXPERT_TOKEN_ABI = [
  // View functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function canAffordConsultation(address) view returns (bool)',
  'function getExpertInfo() view returns (string, string, uint256, uint256, uint256)',

  // State functions
  'function purchaseTokens(uint256) payable',
  'function startConsultation(uint256) returns (bool)',
  'function completeConsultation(address, uint256)',

  // Events
  'event ConsultationStarted(address indexed user, uint256 tokenAmount, uint256 consultationId)',
  'event ConsultationCompleted(address indexed user, uint256 consultationId)',
] as const;

export const EXPERT_FACTORY_ABI = [
  // View functions
  'function getExpertCount() view returns (uint256)',
  'function getAllExperts() view returns (string[], address[], string[], string[], uint256[], bool[])',
  'function getExpert(string) view returns (tuple(address,string,string,string,uint256,address,bool,uint256,uint256))',

  // State functions
  'function createExpert(string, string, string, uint256, address) returns (address)',
  'function batchCreateExperts(string[], string[], string[], uint256[], address[])',

  // Events
  'event ExpertCreated(string indexed symbol, address indexed tokenAddress, address indexed expertAddress, string name, uint256 tokensPerQuery)',
] as const;
