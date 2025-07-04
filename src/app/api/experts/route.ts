import { NextRequest } from 'next/server';

import { createAPIHandler } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import investmentExperts from '@/data/investment_experts.json';

import type { InvestmentExpert } from '@/types/expert';

/**
 * Gets expert specialization
 * @param expert - Expert data
 * @returns Specialization string
 */
function getExpertSpecialization(expert: InvestmentExpert): string {
  if (expert.slug === 'bhorowitz') {
    return 'Execution & Team Building';
  } else if (expert.slug === 'peterthiel') {
    return 'Breakthrough Innovation & Monopoly Creation';
  } else if (expert.slug === 'sgblank') {
    return 'Customer Development & Lean Startup';
  }
  return 'Venture Capital Analysis';
}

/**
 * Gets expert response style
 * @param expert - Expert data
 * @returns Response style description
 */
function getResponseStyle(expert: InvestmentExpert): string {
  if (expert.slug === 'bhorowitz') {
    return 'Direct, practical, execution-focused';
  } else if (expert.slug === 'peterthiel') {
    return 'Contrarian, philosophical, big-picture thinking';
  } else if (expert.slug === 'sgblank') {
    return 'Methodical, customer-centric, hypothesis-driven';
  }
  return 'Professional, analytical';
}

/**
 * Gets typical questions expert asks
 * @param expert - Expert data
 * @returns Array of typical questions
 */
function getTypicalQuestions(expert: InvestmentExpert): string[] {
  if (expert.slug === 'bhorowitz') {
    return [
      'How will you execute this vision?',
      "What's your plan for scaling the team?",
      'How will you handle the inevitable challenges?',
      'What makes you the right CEO for this?',
    ];
  } else if (expert.slug === 'peterthiel') {
    return [
      "What do you believe that others don't?",
      'How will you achieve monopoly-like returns?',
      "What's the 10x better solution here?",
      'Why now and not before?',
    ];
  } else if (expert.slug === 'sgblank') {
    return [
      'Who exactly is your customer?',
      'How will you test this hypothesis?',
      'What have you learned from talking to customers?',
      "What's your minimum viable product?",
    ];
  }
  return ["What's the market opportunity?", 'How will you compete?', 'What are the key risks?'];
}

/**
 * Gets expert investment criteria
 * @param expert - Expert data
 * @returns Array of investment criteria
 */
function getInvestmentCriteria(expert: InvestmentExpert): string[] {
  if (expert.slug === 'bhorowitz') {
    return [
      'Strong founder-market fit',
      'Clear execution plan',
      'Ability to scale team and operations',
      'Resilience under pressure',
    ];
  } else if (expert.slug === 'peterthiel') {
    return [
      'Potential for monopoly creation',
      'Breakthrough technology or approach',
      'Contrarian insights',
      'Massive market opportunity',
    ];
  } else if (expert.slug === 'sgblank') {
    return [
      'Validated customer demand',
      'Clear product-market fit',
      'Repeatable business model',
      'Evidence-based decision making',
    ];
  }
  return [
    'Large market opportunity',
    'Strong competitive advantage',
    'Experienced team',
    'Clear path to profitability',
  ];
}

/**
 * Gets expert communication style
 * @param expert - Expert data
 * @returns Communication style description
 */
function getCommunicationStyle(expert: InvestmentExpert): string {
  if (expert.slug === 'bhorowitz') {
    return 'Uses war stories and analogies, speaks from experience';
  } else if (expert.slug === 'peterthiel') {
    return 'Philosophical and provocative, challenges assumptions';
  } else if (expert.slug === 'sgblank') {
    return 'Structured and methodical, data-driven insights';
  }
  return 'Professional and analytical';
}

/**
 * Enriches expert data with metadata
 * @param expert - Base expert data
 * @returns Enriched expert data
 */
function enrichExpertData(expert: InvestmentExpert) {
  return {
    ...expert,
    metadata: {
      specialization: getExpertSpecialization(expert),
      responseStyle: getResponseStyle(expert),
      keyQuestions: getTypicalQuestions(expert),
      investmentCriteria: getInvestmentCriteria(expert),
      communicationStyle: getCommunicationStyle(expert),
    },
  };
}

/**
 * Filters experts based on criteria
 * @param experts - Array of experts
 * @param includeRag - Include RAG experts
 * @param expertSlugs - Specific expert slugs to include
 * @returns Filtered experts
 */
function filterExperts(
  experts: InvestmentExpert[],
  includeRag: boolean,
  expertSlugs?: string[],
): InvestmentExpert[] {
  let filtered = experts;

  if (expertSlugs && expertSlugs.length > 0) {
    filtered = filtered.filter(expert => expertSlugs.includes(expert.slug));
  }

  if (!includeRag) {
    filtered = filtered.filter(expert => !expert.isRagExpert);
  }

  return filtered;
}

/**
 * Gets expert categories
 * @param experts - Array of experts
 * @returns Array of categories
 */
function getExpertCategories(experts: InvestmentExpert[]): string[] {
  const categories = new Set<string>();

  experts.forEach(expert => {
    if (expert.isRagExpert) {
      categories.add('RAG-powered');
    } else {
      categories.add('Standard');
    }

    const expertiseArray = Array.isArray(expert.expertise) ? expert.expertise : [expert.expertise];

    if (expertiseArray.some((exp: string) => exp.toLowerCase().includes('early'))) {
      categories.add('Early Stage');
    }

    if (expertiseArray.some((exp: string) => exp.toLowerCase().includes('growth'))) {
      categories.add('Growth Stage');
    }
  });

  return Array.from(categories);
}

/**
 * GET /api/experts - Get list of available experts
 */
export const GET = createAPIHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const includeRag = url.searchParams.get('includeRag') === 'true';
  const expertSlugs = url.searchParams.get('experts')?.split(',');

  const experts = investmentExperts as InvestmentExpert[];
  const filteredExperts = filterExperts(experts, includeRag, expertSlugs);
  const enrichedExperts = filteredExperts.map(enrichExpertData);

  return {
    experts: enrichedExperts,
    availableCount: enrichedExperts.length,
    totalCount: investmentExperts.length,
    categories: getExpertCategories(enrichedExperts),
  };
});

/**
 * POST /api/experts - Get detailed information about specific experts
 */
export const POST = createAPIHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = ValidationSchemas.expert.request.parse(body);
  const { expertSlugs, includePrompts } = validatedData;

  const experts = investmentExperts.filter(expert =>
    expertSlugs.includes(expert.slug),
  ) as InvestmentExpert[];

  if (experts.length === 0) {
    throw new Error('No experts found with provided slugs');
  }

  const detailedExperts = experts.map(expert => {
    const baseExpert = enrichExpertData(expert);

    if (includePrompts) {
      const expertiseList = Array.isArray(expert.expertise)
        ? expert.expertise.join(', ')
        : expert.expertise;

      return {
        ...baseExpert,
        prompts: {
          chatPrompt: `You are ${expert.name} from ${expert.fund}. Methodology: ${expert.methodology}. Focus areas: ${expertiseList}.`,
          analysisPrompt: `Analyze this startup from ${expert.name}'s perspective, focusing on ${expert.focus} and applying ${expert.methodology} methodology.`,
        },
      };
    }

    return baseExpert;
  });

  return {
    experts: detailedExperts,
    requestedCount: expertSlugs.length,
    foundCount: experts.length,
    missingExperts: expertSlugs.filter(slug => !experts.some(expert => expert.slug === slug)),
  };
});
