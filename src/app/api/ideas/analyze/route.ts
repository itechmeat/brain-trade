import { NextRequest } from 'next/server';

import { createAPIHandler } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import { generateDocumentFromIdea } from '@/lib/api/ai-utils';
import { getDocumentCreationPrompt } from '@/lib/prompts';

import { AvailableModel } from '@/types/ai';

/**
 * Counts markdown sections in document
 * @param document - Markdown document
 * @returns Number of sections
 */
function countMarkdownSections(document: string): number {
  const sectionHeaders = document.match(/^##\s+/gm);
  return sectionHeaders ? sectionHeaders.length : 0;
}

/**
 * Extracts key insights from document
 * @param document - Generated document
 * @returns Array of key insights
 */
function extractKeyInsights(document: string): string[] {
  const insights: string[] = [];

  const execSummaryMatch = document.match(/## Executive Summary\s*([\s\S]*?)(?=##|$)/);
  if (execSummaryMatch) {
    const summary = execSummaryMatch[1].trim();
    const lines = summary.split('\n').filter(line => line.trim().startsWith('-'));
    insights.push(...lines.slice(0, 3).map(line => line.replace(/^-\s*/, '').trim()));
  }

  if (insights.length === 0) {
    insights.push(
      'Comprehensive business analysis completed',
      'Market opportunity and competitive landscape assessed',
      'Financial projections and risk analysis provided',
    );
  }

  return insights;
}

/**
 * Analyzes business idea and creates structured document
 * @param idea - Business idea to analyze
 * @param selectedModel - AI model to use
 * @returns Analysis result with document
 */
async function analyzeBusinessIdea(idea: string, selectedModel?: string) {
  console.log('=== DOCUMENT GENERATION LLM REQUEST ===');
  console.log('BUSINESS IDEA:', idea);
  console.log('SELECTED MODEL:', selectedModel || 'default');

  const startTime = Date.now();
  const prompt = getDocumentCreationPrompt({ originalIdea: idea });

  console.log('DOCUMENT PROMPT LENGTH:', prompt.length);
  console.log('PROMPT PREVIEW (first 500 chars):', prompt.substring(0, 500) + '...');
  console.log('=== END DOCUMENT GENERATION REQUEST ===');

  const result = await generateDocumentFromIdea(prompt, selectedModel as AvailableModel);

  // Extract all data from LLM result
  let generatedDocument = result.result.document;
  const projectTitle = result.result.title;
  const detectedLanguage = result.result.language;
  const assistantMessage = result.result.assistantMessage;

  // Replace any placeholder in the document with the actual title
  generatedDocument = generatedDocument.replace('{{PROJECT_TITLE}}', projectTitle);

  const processingTime = Date.now() - startTime;
  console.log(`Document generated successfully in ${processingTime}ms`);
  console.log('DETECTED LANGUAGE FROM LLM:', detectedLanguage);

  return {
    originalIdea: idea,
    projectTitle,
    projectDocument: generatedDocument,
    detectedLanguage,
    assistantMessage, // LLM-generated localized message
    analysis: {
      documentLength: generatedDocument.length,
      sectionsGenerated: countMarkdownSections(generatedDocument),
      keyInsights: extractKeyInsights(generatedDocument),
      confidence: result.result.confidence,
      reasoning: result.result.reasoning,
    },
    metadata: {
      processingTime,
      attempts: result.attempts,
      model: result.model,
      documentWordCount: generatedDocument.split(' ').length,
    },
  };
}

/**
 * POST /api/ideas/analyze - Analyze business idea and create structured document
 */
export const POST = createAPIHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = ValidationSchemas.idea.analyze.parse(body);
  const { idea, selectedModel } = validatedData;

  return await analyzeBusinessIdea(idea, selectedModel);
});
