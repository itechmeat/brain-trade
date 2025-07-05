/**
 * Types for investment experts
 */

export interface InvestmentExpert {
  name: string;
  slug: string;
  collection?: string;
  fund: string;
  token?: string;
  tokenPrice?: number;
  costPerQuery?: number;
  tokensPerQuery?: number; // Number of tokens per query
  description?: string;
  methodology: string;
  expertise: string;
  focus: string;
  price: number;
  photo?: string;
  website?: string;
  twitter?: string;
  isRagExpert?: boolean;
  ragConfig?: {
    topK: number;
    scoreThreshold: number;
    maxContextLength: number;
  };
  systemPrompt?: string; // Custom prompt for each expert
}
