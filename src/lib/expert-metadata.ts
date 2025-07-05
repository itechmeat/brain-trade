/**
 * Expert metadata utilities
 *
 * Provides metadata for experts from JSON file to complement blockchain data
 */

import investmentExperts from '@/data/investment_experts.json';
import type { InvestmentExpert } from '@/types/expert';

export interface ExpertMetadata {
  photo?: string;
  description?: string;
  fund?: string;
  website?: string;
  twitter?: string;
  expertise?: string;
  methodology?: string;
  systemPrompt?: string;
}

/**
 * Get expert metadata by symbol
 * @param symbol - Expert token symbol (e.g., 'btBEN', 'btTHIEL')
 * @returns Expert metadata or null if not found
 */
export function getExpertMetadata(symbol: string): ExpertMetadata | null {
  const experts = investmentExperts as InvestmentExpert[];
  const expert = experts.find(e => e.token === symbol);

  if (!expert) {
    return null;
  }

  return {
    photo: expert.photo,
    description: expert.description,
    fund: expert.fund,
    website: expert.website,
    twitter: expert.twitter,
    expertise: expert.expertise,
    methodology: expert.methodology,
    systemPrompt: expert.systemPrompt,
  };
}

/**
 * Get expert metadata by name
 * @param name - Expert name
 * @returns Expert metadata or null if not found
 */
export function getExpertMetadataByName(name: string): ExpertMetadata | null {
  const experts = investmentExperts as InvestmentExpert[];
  const expert = experts.find(e => e.name === name);

  if (!expert) {
    return null;
  }

  return {
    photo: expert.photo,
    description: expert.description,
    fund: expert.fund,
    website: expert.website,
    twitter: expert.twitter,
    expertise: expert.expertise,
    methodology: expert.methodology,
    systemPrompt: expert.systemPrompt,
  };
}

/**
 * Get expert metadata by slug
 * @param slug - Expert slug (e.g., 'bhorowitz', 'peterthiel')
 * @returns Expert metadata or null if not found
 */
export function getExpertMetadataBySlug(slug: string): ExpertMetadata | null {
  const experts = investmentExperts as InvestmentExpert[];
  const expert = experts.find(e => e.slug === slug);

  if (!expert) {
    return null;
  }

  return {
    photo: expert.photo,
    description: expert.description,
    fund: expert.fund,
    website: expert.website,
    twitter: expert.twitter,
    expertise: expert.expertise,
    methodology: expert.methodology,
    systemPrompt: expert.systemPrompt,
  };
}

/**
 * Get all expert metadata
 * @returns Array of all expert metadata
 */
export function getAllExpertMetadata(): (ExpertMetadata & {
  name: string;
  slug: string;
  symbol: string;
})[] {
  const experts = investmentExperts as InvestmentExpert[];

  return experts
    .filter(expert => expert.token) // Filter out experts without tokens
    .map(expert => ({
      name: expert.name,
      slug: expert.slug,
      symbol: expert.token!,
      photo: expert.photo,
      description: expert.description,
      fund: expert.fund,
      website: expert.website,
      twitter: expert.twitter,
      expertise: expert.expertise,
      methodology: expert.methodology,
      systemPrompt: expert.systemPrompt,
    }));
}
