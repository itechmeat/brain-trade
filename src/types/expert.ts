/**
 * Types for investment experts
 */

export interface InvestmentExpert {
  name: string;
  slug: string;
  collection?: string;
  fund: string;
  methodology: string;
  expertise: string;
  focus: string;
  price: number;
  photo?: string;
  website?: string;
  twitter?: string;
  isRagExpert?: boolean;
  isAssistant?: boolean;
  ragConfig?: {
    topK: number;
    scoreThreshold: number;
    maxContextLength: number;
  };
}
