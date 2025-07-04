import { NextRequest } from 'next/server';

import { createAPIHandlerWithParams } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import { getChatSession, updateChatSession } from '@/lib/chat-utils';
import { getAIProviderConfig } from '@/lib/api/ai-utils';
import {
  getDocumentUpdatePrompt,
  getDocumentUpdateMessagePrompt,
  formatChatHistoryForPrompt,
} from '@/lib/prompts';

import {
  AvailableModel,
  GeminiGenerateRequest,
  GeminiGenerateResponse,
  OpenRouterRequest,
  OpenRouterResponse,
  AI_TIMEOUT,
  AssistantMessageGenerationResult,
  AssistantMessageGenerationResultSchema,
} from '@/types/ai';
import { APIError } from '@/lib/api/middleware/auth';

/**
 * Generates updated document using raw AI response (markdown format)
 * @param prompt - Document update prompt
 * @param selectedModel - AI model to use
 * @returns Raw markdown document
 */
async function generateDocumentUpdate(
  prompt: string,
  selectedModel?: AvailableModel,
): Promise<string> {
  const providerConfig = getAIProviderConfig(selectedModel);

  console.log('=== DOCUMENT UPDATE LLM REQUEST ===');
  console.log('PROMPT LENGTH:', prompt.length);
  console.log('SELECTED MODEL:', providerConfig.model);
  console.log('PROMPT PREVIEW (first 500 chars):', prompt.substring(0, 500) + '...');
  console.log('=== END DOCUMENT UPDATE REQUEST ===');

  switch (providerConfig.provider) {
    case 'gemini':
      return await generateDocumentUpdateWithGemini(prompt, providerConfig.apiKey);
    case 'openrouter':
      return await generateDocumentUpdateWithOpenRouter(prompt, {
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
      });
    default:
      throw new APIError(`Unsupported AI provider: ${providerConfig.provider}`, 500);
  }
}

/**
 * Generate document update with Gemini (raw markdown response)
 */
async function generateDocumentUpdateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const geminiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const requestBody: GeminiGenerateRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(AI_TIMEOUT),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new APIError(
      `Gemini API error: ${response.status} ${response.statusText}: ${errorBody}`,
      response.status,
    );
  }

  const data: GeminiGenerateResponse = await response.json();

  if (data.error) {
    throw new APIError(`Gemini API error: ${data.error.message}`, data.error.code || 500);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new APIError('No candidates returned from Gemini API', 500);
  }

  const candidate = data.candidates[0];
  if (!candidate.content?.parts || candidate.content.parts.length === 0) {
    throw new APIError('No content returned from Gemini API', 500);
  }

  return candidate.content.parts[0].text;
}

/**
 * Generate document update with OpenRouter (raw markdown response)
 */
async function generateDocumentUpdateWithOpenRouter(
  prompt: string,
  config: { apiKey: string; model: string },
): Promise<string> {
  const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const requestBody: OpenRouterRequest = {
    model: config.model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'AI Venture Agent',
  };

  const response = await fetch(openRouterUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(AI_TIMEOUT),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(
      `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`,
      500,
    );
  }

  const data: OpenRouterResponse = await response.json();

  if (data.error) {
    throw new APIError(`OpenRouter API error: ${data.error.message}`, 500);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new APIError('No content generated from OpenRouter API', 500);
  }

  const choice = data.choices[0];
  if (!choice.message?.content) {
    throw new APIError('No content in OpenRouter response', 500);
  }

  return choice.message.content.trim();
}

/**
 * Generates assistant message for applied recommendations using AI
 * @param prompt - Assistant message generation prompt
 * @param selectedModel - AI model to use
 * @returns Assistant message generation result
 */
async function generateAssistantMessage(
  prompt: string,
  selectedModel?: AvailableModel,
): Promise<{ result: AssistantMessageGenerationResult; attempts: number }> {
  const providerConfig = getAIProviderConfig(selectedModel);

  console.log('=== ASSISTANT MESSAGE GENERATION LLM REQUEST ===');
  console.log('PROMPT LENGTH:', prompt.length);
  console.log('SELECTED MODEL:', providerConfig.model);
  console.log('=== END ASSISTANT MESSAGE GENERATION REQUEST ===');

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      let rawResponse: string;

      switch (providerConfig.provider) {
        case 'gemini':
          rawResponse = await generateAssistantMessageWithGemini(prompt, providerConfig.apiKey);
          break;
        case 'openrouter':
          rawResponse = await generateAssistantMessageWithOpenRouter(prompt, {
            apiKey: providerConfig.apiKey,
            model: providerConfig.model,
          });
          break;
        default:
          throw new APIError(`Unsupported AI provider: ${providerConfig.provider}`, 500);
      }

      // Parse and validate JSON response
      const cleanedResponse = rawResponse
        .trim()
        .replace(/```json\n?/, '')
        .replace(/```$/, '');
      let parsedResult: unknown;

      try {
        parsedResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        throw new APIError(`Invalid JSON response from AI: ${parseError}`, 500);
      }

      const result = AssistantMessageGenerationResultSchema.parse(parsedResult);
      return { result, attempts };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Assistant message generation attempt ${attempts} failed:`, lastError.message);

      if (attempts === maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  throw new APIError(
    `Failed to generate assistant message after ${maxAttempts} attempts. Last error: ${lastError?.message}`,
    500,
  );
}

/**
 * Generate assistant message with Gemini
 */
async function generateAssistantMessageWithGemini(prompt: string, apiKey: string): Promise<string> {
  const geminiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const requestBody: GeminiGenerateRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(AI_TIMEOUT),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new APIError(
      `Gemini API error: ${response.status} ${response.statusText}: ${errorBody}`,
      response.status,
    );
  }

  const data: GeminiGenerateResponse = await response.json();

  if (data.error) {
    throw new APIError(`Gemini API error: ${data.error.message}`, data.error.code || 500);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new APIError('No candidates returned from Gemini API', 500);
  }

  const candidate = data.candidates[0];
  if (!candidate.content?.parts || candidate.content.parts.length === 0) {
    throw new APIError('No content returned from Gemini API', 500);
  }

  return candidate.content.parts[0].text;
}

/**
 * Generate assistant message with OpenRouter
 */
async function generateAssistantMessageWithOpenRouter(
  prompt: string,
  config: { apiKey: string; model: string },
): Promise<string> {
  const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const requestBody: OpenRouterRequest = {
    model: config.model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'AI Venture Agent',
  };

  const response = await fetch(openRouterUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(AI_TIMEOUT),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(
      `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`,
      500,
    );
  }

  const data: OpenRouterResponse = await response.json();

  if (data.error) {
    throw new APIError(`OpenRouter API error: ${data.error.message}`, 500);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new APIError('No content generated from OpenRouter API', 500);
  }

  const choice = data.choices[0];
  if (!choice.message?.content) {
    throw new APIError('No content in OpenRouter response', 500);
  }

  return choice.message.content.trim();
}

/**
 * Cleans document formatting artifacts
 * @param document - Document to clean
 * @returns Cleaned document
 */
function cleanDocumentFormatting(document: string): string {
  return document
    .replace(/^```(?:markdown|md)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

/**
 * Extracts markdown sections from document
 * @param document - Markdown document
 * @returns Array of section titles
 */
function extractMarkdownSections(document: string): string[] {
  const sectionRegex = /^##\s+(.+)$/gm;
  const sections: string[] = [];
  let match;

  while ((match = sectionRegex.exec(document)) !== null) {
    sections.push(match[1].trim());
  }

  return sections;
}

/**
 * Extracts main changes between documents
 * @param oldDocument - Original document
 * @param newDocument - Updated document
 * @returns Array of change descriptions
 */
function extractDocumentChanges(oldDocument: string | undefined, newDocument: string): string[] {
  const changes: string[] = [];

  if (!oldDocument) {
    changes.push('Document created from scratch');
    return changes;
  }

  const oldLength = oldDocument.length;
  const newLength = newDocument.length;

  if (newLength > oldLength * 1.2) {
    changes.push('Significant content added');
  } else if (newLength < oldLength * 0.8) {
    changes.push('Content condensed or restructured');
  } else {
    changes.push('Content refined and updated');
  }

  const oldSections = extractMarkdownSections(oldDocument);
  const newSections = extractMarkdownSections(newDocument);

  const addedSections = newSections.filter(section => !oldSections.includes(section));
  if (addedSections.length > 0) {
    changes.push(`New sections added: ${addedSections.join(', ')}`);
  }

  if (changes.length === 0) {
    changes.push('Document updated with expert recommendations');
  }

  return changes;
}

/**
 * Creates assistant message for applied recommendations using LLM
 * @param sessionId - Chat session ID
 * @param processingTime - Time taken to process
 * @param chatHistory - Chat history for language detection
 * @param changes - Applied changes
 * @param selectedModel - AI model to use
 * @returns Assistant message
 */
async function createAssistantMessage(
  sessionId: string,
  processingTime: number,
  chatHistory: string,
  changes: string[],
  selectedModel?: AvailableModel,
) {
  const prompt = getDocumentUpdateMessagePrompt({
    chatHistory,
    changes: changes.join(', '),
  });

  const messageResult = await generateAssistantMessage(prompt, selectedModel);

  return {
    id: `assistant-apply-${Date.now()}`,
    chatId: sessionId,
    expertId: 'assistant',
    content: messageResult.result.assistantMessage,
    timestamp: new Date(),
    type: 'expert' as const,
    metadata: {
      confidence: 0.9,
      reasoning: 'Applied expert recommendations to project document',
      processingTime,
      language: messageResult.result.language,
    },
    hasRecommendations: false,
  };
}

/**
 * Updates document with recommendations
 * @param sessionId - Chat session ID
 * @param messageId - Message ID with recommendations
 * @param selectedModel - AI model to use
 * @returns Update result
 */
async function updateDocumentWithRecommendations(
  sessionId: string,
  messageId: string,
  selectedRecommendations: string[],
  selectedModel?: string,
) {
  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  const message = session.messages.find(m => m.id === messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  if (!selectedRecommendations || selectedRecommendations.length === 0) {
    throw new Error('No recommendations selected');
  }

  console.log(`Processing selected recommendations for message ${messageId}`);
  console.log('Session ID:', sessionId);
  console.log('Session exists:', !!session);
  console.log('Selected recommendations count:', selectedRecommendations.length);
  console.log('Selected recommendations:', selectedRecommendations);
  console.log('Project document exists:', !!session.projectDocument);
  console.log('Project document length:', session.projectDocument?.length || 0);
  console.log(
    'Project document preview:',
    session.projectDocument?.substring(0, 100) || 'No document',
  );

  const startTime = Date.now();

  // Check if document exists
  if (!session.projectDocument || session.projectDocument.trim() === '') {
    console.error('No project document found in session');
    throw new Error('No project document exists to update');
  }

  const prompt = getDocumentUpdatePrompt({
    currentDocument: session.projectDocument,
    recommendations: selectedRecommendations.join('\n• '),
  });

  console.log('Generating updated document...');
  const rawDocument = await generateDocumentUpdate(prompt, selectedModel as AvailableModel);

  const updatedDocument = cleanDocumentFormatting(rawDocument);

  const processingTime = Date.now() - startTime;

  // Add applied recommendations to the session's history
  const currentAppliedRecommendations = session.appliedRecommendations || [];
  const newAppliedRecommendations = [...currentAppliedRecommendations, ...selectedRecommendations];

  console.log('Current applied recommendations:', currentAppliedRecommendations.length);
  console.log('New recommendations to apply:', selectedRecommendations.length);
  console.log('Total applied after update:', newAppliedRecommendations.length);

  const updateSuccess = updateChatSession(sessionId, {
    projectDocument: updatedDocument,
    appliedRecommendations: newAppliedRecommendations,
    updatedAt: new Date(),
  });

  if (!updateSuccess) {
    throw new Error('Failed to update chat session with new document');
  }

  console.log(`Document updated successfully in ${processingTime}ms`);

  const changes = extractDocumentChanges(session.projectDocument, updatedDocument);

  // Format chat history for language detection
  const chatHistory = formatChatHistoryForPrompt(session.messages);

  const assistantMessage = await createAssistantMessage(
    sessionId,
    processingTime,
    chatHistory,
    changes,
    selectedModel as AvailableModel,
  );

  return {
    updatedDocument,
    assistantMessage,
    changes,
    metadata: {
      processingTime,
      attempts: 1,
      model: selectedModel || 'gemini-2.0-flash',
      originalMessageId: messageId,
      documentLength: updatedDocument.length,
    },
  };
}

/**
 * POST /api/chats/[id]/apply-recommendations - Apply expert recommendations to document
 */
export const POST = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;
  const body = await request.json();
  const validatedData = ValidationSchemas.recommendations.apply.parse(body);
  const { messageId, selectedRecommendations, selectedModel } = validatedData;

  const result = await updateDocumentWithRecommendations(
    sessionId,
    messageId,
    selectedRecommendations,
    selectedModel,
  );
  const updatedSession = getChatSession(sessionId);

  return {
    ...result,
    session: updatedSession,
  };
});
