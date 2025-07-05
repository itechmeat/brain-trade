/**
 * Marketplace Adapter
 *
 * Adapter for converting data between InvestmentExpert and ExpertInfo types.
 * Ensures compatibility between main page and tokenized-chat.
 */

import { InvestmentExpert } from '@/types/expert';
import { ExpertInfo, TokenBalance } from '@/types/contracts';
import {
  MarketplaceExpert,
  AdapterConfig,
  ExpertConversionResult,
  FieldMapping,
  MarketplaceConnectionState,
} from '@/types/marketplace';

// ============================================================================
// Constants and Mappings
// ============================================================================

/**
 * Field mapping between InvestmentExpert and ExpertInfo
 */
const EXPERT_FIELD_MAPPING: FieldMapping[] = [
  { source: 'name', target: 'name', required: true },
  { source: 'token', target: 'symbol', required: true },
  {
    source: 'tokensPerQuery',
    target: 'tokensPerQuery',
    transform: value => BigInt(value as number),
  },
  { source: 'description', target: 'category', required: false },
  { source: 'fund', target: 'category', required: false },
];

/**
 * Default adapter configuration
 */
const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  includeBlockchain: true,
  includeUserBalances: false,
  userAddress: undefined,
};

// ============================================================================
// Core Conversion Functions
// ============================================================================

/**
 * Converts InvestmentExpert to ExpertInfo
 * @param expert - Source expert
 * @param config - Conversion configuration
 * @returns Conversion result
 */
export function convertInvestmentExpertToExpertInfo(
  expert: InvestmentExpert,
  config: Partial<AdapterConfig> = {},
): ExpertConversionResult {
  const finalConfig = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic field conversion
    const expertInfo: ExpertInfo = {
      name: expert.name,
      symbol: expert.token || `bt${expert.slug.toUpperCase()}`,
      category: expert.description || expert.fund || 'Investment Expert',
      tokensPerQuery: expert.tokensPerQuery || 10,
      isActive: true,
      tokenAddress: '', // Will be loaded from contracts
      expertAddress: '', // Will be loaded from contracts
      totalConsultations: 0,
      totalRevenue: 0,
    };

    // Check required fields
    if (!expertInfo.name) {
      errors.push('Expert name is required');
    }

    if (!expertInfo.symbol) {
      errors.push('Expert symbol is required');
    }

    if (!expertInfo.tokenAddress && finalConfig.includeBlockchain) {
      warnings.push(`Token address will be loaded from contracts for expert ${expert.slug}`);
    }

    return {
      expert: expertInfo,
      hasErrors: errors.length > 0,
      errors,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown conversion error';
    return {
      expert: {} as ExpertInfo,
      hasErrors: true,
      errors: [errorMessage],
      warnings,
    };
  }
}

/**
 * Converts ExpertInfo back to InvestmentExpert
 * @param expertInfo - ExpertInfo to convert
 * @returns Converted InvestmentExpert
 */
export function convertExpertInfoToInvestmentExpert(expertInfo: ExpertInfo): InvestmentExpert {
  return {
    name: expertInfo.name,
    slug: expertInfo.symbol.toLowerCase().replace('bt', ''),
    fund: expertInfo.category,
    token: expertInfo.symbol,
    tokensPerQuery: Number(expertInfo.tokensPerQuery),
    description: expertInfo.category,
    methodology: 'RAG-based analysis using proven venture capital investment methodologies',
    expertise: 'AI-powered analysis and consultation',
    focus: 'Startup development and investment analysis',
    price: Number(expertInfo.tokensPerQuery) * 0.001, // Approximate price
    photo: `/experts/${expertInfo.symbol.toLowerCase().replace('bt', '')}.jpg`,
    isRagExpert: true,
    ragConfig: {
      topK: 5,
      scoreThreshold: 0.3,
      maxContextLength: 4000,
    },
  };
}

/**
 * Creates MarketplaceExpert from InvestmentExpert with blockchain data
 * @param expert - Source expert
 * @param tokenBalance - User token balance
 * @param config - Configuration
 * @returns MarketplaceExpert
 */
export function createMarketplaceExpert(
  expert: InvestmentExpert,
  tokenBalance?: TokenBalance,
  config: Partial<AdapterConfig> = {},
): MarketplaceExpert {
  const finalConfig = { ...DEFAULT_ADAPTER_CONFIG, ...config };

  const marketplaceExpert: MarketplaceExpert = {
    ...expert,
  };

  if (finalConfig.includeBlockchain) {
    marketplaceExpert.blockchain = {
      tokenAddress: '', // Will be loaded from contracts
      isActive: false, // Will be determined from contracts
      userBalance: tokenBalance,
      balanceLoading: false,
    };
  }

  return marketplaceExpert;
}

// ============================================================================
// Batch Conversion Functions
// ============================================================================

/**
 * Converts array of InvestmentExpert to array of ExpertInfo
 * @param experts - Array of experts
 * @param config - Conversion configuration
 * @returns Array of conversion results
 */
export function convertInvestmentExpertsToExpertInfos(
  experts: InvestmentExpert[],
  config: Partial<AdapterConfig> = {},
): ExpertConversionResult[] {
  return experts.map(expert => convertInvestmentExpertToExpertInfo(expert, config));
}

/**
 * Creates array of MarketplaceExpert from array of InvestmentExpert
 * @param experts - Array of experts
 * @param tokenBalances - Map of token balances
 * @param config - Configuration
 * @returns Array of MarketplaceExpert
 */
export function createMarketplaceExperts(
  experts: InvestmentExpert[],
  tokenBalances: Map<string, TokenBalance> = new Map(),
  config: Partial<AdapterConfig> = {},
): MarketplaceExpert[] {
  return experts.map(expert => {
    const tokenBalance = tokenBalances.get(expert.token || expert.slug);
    return createMarketplaceExpert(expert, tokenBalance, config);
  });
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates InvestmentExpert for conversion to ExpertInfo
 * @param expert - Expert to validate
 * @returns Validation result
 */
export function validateInvestmentExpertForConversion(expert: InvestmentExpert): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!expert.name) {
    errors.push('Expert name is required');
  }

  if (!expert.slug) {
    errors.push('Expert slug is required');
  }

  // Recommended fields
  if (!expert.token) {
    warnings.push('Expert token symbol is missing, will be generated from slug');
  }

  if (!expert.tokensPerQuery) {
    warnings.push('Tokens per query not specified, will use default value');
  }

  if (!expert.description && !expert.fund) {
    warnings.push('Expert description or fund information is missing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Валидирует ExpertInfo для обратной конвертации
 * @param expertInfo - ExpertInfo для валидации
 * @returns Результат валидации
 */
export function validateExpertInfoForConversion(expertInfo: ExpertInfo): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!expertInfo.name) {
    errors.push('Expert name is required');
  }

  if (!expertInfo.symbol) {
    errors.push('Expert symbol is required');
  }

  if (!expertInfo.tokenAddress) {
    errors.push('Token address is required');
  }

  if (expertInfo.tokensPerQuery <= 0) {
    errors.push('Tokens per query must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets token address for expert
 * @param expert - Expert
 * @returns Token address (will be loaded from contracts)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTokenAddressForExpert(_expert: InvestmentExpert): string {
  // Token address will be loaded from smart contracts
  return '';
}

/**
 * Gets token symbol for expert
 * @param expert - Expert
 * @returns Token symbol
 */
export function getTokenSymbolForExpert(expert: InvestmentExpert): string {
  return expert.token || `bt${expert.slug.toUpperCase()}`;
}

/**
 * Checks if expert supports blockchain functionality
 * @param expert - Expert
 * @returns true if supports blockchain
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isBlockchainSupportedForExpert(_expert: InvestmentExpert): boolean {
  // All experts support blockchain, token addresses will be loaded from contracts
  return true;
}

/**
 * Creates default connection state for marketplace
 * @returns Default connection state
 */
export function createDefaultMarketplaceConnectionState(): MarketplaceConnectionState {
  return {
    status: 'disconnected',
    isReady: false,
    isCorrectChain: false,
    userAddress: undefined,
    error: undefined,
  };
}

/**
 * Filters experts supporting blockchain
 * @param experts - Array of experts
 * @returns Array of experts with blockchain support
 */
export function filterBlockchainSupportedExperts(experts: InvestmentExpert[]): InvestmentExpert[] {
  return experts.filter(isBlockchainSupportedForExpert);
}

/**
 * Groups experts by blockchain support
 * @param experts - Array of experts
 * @returns Object with grouping
 */
export function groupExpertsByBlockchainSupport(experts: InvestmentExpert[]): {
  supported: InvestmentExpert[];
  notSupported: InvestmentExpert[];
} {
  const supported: InvestmentExpert[] = [];
  const notSupported: InvestmentExpert[] = [];

  experts.forEach(expert => {
    if (isBlockchainSupportedForExpert(expert)) {
      supported.push(expert);
    } else {
      notSupported.push(expert);
    }
  });

  return { supported, notSupported };
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Creates safe version of MarketplaceExpert on conversion errors
 * @param expert - Source expert
 * @param error - Conversion error
 * @returns Safe version of MarketplaceExpert
 */
export function createSafeMarketplaceExpert(
  expert: InvestmentExpert,
  error?: string,
): MarketplaceExpert {
  return {
    ...expert,
    blockchain: {
      tokenAddress: '',
      isActive: false,
      userBalance: undefined,
      balanceLoading: false,
    },
    // Add error information to description
    description: error
      ? `${expert.description || ''} (Error: ${error})`.trim()
      : expert.description,
  };
}

/**
 * Logs conversion errors
 * @param expert - Expert
 * @param result - Conversion result
 */
export function logConversionErrors(
  expert: InvestmentExpert,
  result: ExpertConversionResult,
): void {
  if (result.hasErrors) {
    console.error(`❌ Conversion errors for expert ${expert.slug}:`, result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️ Conversion warnings for expert ${expert.slug}:`, result.warnings);
  }
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Creates debug information about conversion
 * @param expert - Source expert
 * @param result - Conversion result
 * @returns Debug information
 */
export function createConversionDebugInfo(
  expert: InvestmentExpert,
  result: ExpertConversionResult,
): {
  source: InvestmentExpert;
  target: ExpertInfo;
  mapping: Record<string, unknown>;
  issues: { errors: string[]; warnings: string[] };
} {
  return {
    source: expert,
    target: result.expert,
    mapping: EXPERT_FIELD_MAPPING.reduce(
      (acc, mapping) => {
        acc[mapping.target] = expert[mapping.source];
        return acc;
      },
      {} as Record<string, unknown>,
    ),
    issues: {
      errors: result.errors,
      warnings: result.warnings,
    },
  };
}

// ============================================================================
// All functions are exported individually with 'export function' declarations
// ============================================================================
