/**
 * Expert Adapter
 *
 * Adapter for converting investment_experts.json to ExpertInfo format
 * for tokenized chat
 */

import { ExpertInfo } from '@/types/contracts';
import type { InvestmentExpert } from '@/types/expert';
import investmentExperts from '@/data/investment_experts.json';

/**
 * Converts InvestmentExpert to ExpertInfo for blockchain integration
 * Note: This function should not be used for real blockchain operations
 * as it doesn't provide real contract addresses
 */
export function convertToExpertInfo(investmentExpert: InvestmentExpert): ExpertInfo {
  return {
    symbol: investmentExpert.token || 'UNKNOWN',
    tokenAddress: '', // Will be filled by blockchain data
    name: investmentExpert.name || 'Unknown Expert',
    category: investmentExpert.expertise?.split(',')[0]?.trim() || 'General',
    tokensPerQuery: investmentExpert.tokensPerQuery || 10,
    expertAddress: '', // Will be filled by blockchain data
    isActive: true,
    totalConsultations: 0,
    totalRevenue: 0,
  };
}

/**
 * Gets all experts in ExpertInfo format
 */
export function getAllTokenizedExperts(): ExpertInfo[] {
  return (investmentExperts as InvestmentExpert[]).map(convertToExpertInfo);
}

/**
 * Gets expert by token symbol
 */
export function getExpertBySymbol(symbol: string): ExpertInfo | null {
  const investmentExpert = investmentExperts.find(expert => expert.token === symbol);
  return investmentExpert ? convertToExpertInfo(investmentExpert as InvestmentExpert) : null;
}

/**
 * Gets expert by slug
 */
export function getExpertBySlug(slug: string): ExpertInfo | null {
  const investmentExpert = investmentExperts.find(expert => expert.slug === slug);
  return investmentExpert ? convertToExpertInfo(investmentExpert as InvestmentExpert) : null;
}

/**
 * Converts ExpertInfo back to slug for API calls
 */
export function getSlugFromExpertInfo(expertInfo: ExpertInfo): string {
  const investmentExpert = investmentExperts.find(expert => expert.token === expertInfo.symbol);
  return investmentExpert?.slug || expertInfo.symbol.toLowerCase();
}
