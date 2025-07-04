import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

import { createAPIHandlerWithParams } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import { getChatSession, updateChatSession } from '@/lib/chat-utils';
import { generateExpertChatResponse, generateDocumentUpdate } from '@/lib/api/ai-utils';
import {
  getExpertChatPrompt,
  getUserMessageHandlerPrompt,
  formatChatHistoryForPrompt,
} from '@/lib/prompts';
import investmentExperts from '@/data/investment_experts.json';

import { ChatMessage, ChatSession } from '@/types/chat';
import { ExpertChatResponse } from '@/types/ai';
import { AvailableModel } from '@/types/ai';
import type { InvestmentExpert } from '@/types/expert';

/**
 * Creates a user message
 * @param sessionId - Chat session ID
 * @param content - Message content
 * @param type - Message type
 * @param expertId - Expert ID if applicable
 * @returns Created message
 */
function createUserMessage(
  sessionId: string,
  content: string,
  type: 'user' | 'expert' | 'system',
  expertId?: string,
): ChatMessage {
  return {
    id: nanoid(12),
    chatId: sessionId,
    content,
    timestamp: new Date(),
    type,
    status: 'sent',
    expertId,
  };
}

/**
 * Adds message to session
 * @param sessionId - Chat session ID
 * @param message - Message to add
 */
function addMessageToSession(sessionId: string, message: ChatMessage): void {
  const session = getChatSession(sessionId);
  if (!session) return;

  const updatedMessages = [...session.messages, message];
  updateChatSession(sessionId, {
    messages: updatedMessages,
    updatedAt: new Date(),
  });
}

/**
 * Formats chat history for prompts
 * @param messages - Array of chat messages
 * @returns Formatted chat history string
 */
function formatChatHistory(messages: ChatMessage[]): string {
  if (messages.length === 0) {
    return 'No previous messages in this conversation.';
  }

  return messages
    .map(msg => {
      const speaker =
        msg.type === 'user'
          ? 'USER'
          : msg.type === 'expert'
            ? `EXPERT (${msg.expertId})`
            : 'SYSTEM';
      const timestamp = msg.timestamp.toISOString();
      return `[${timestamp}] ${speaker}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Gets expert data by slug
 * @param expertSlug - Expert slug
 * @returns Expert data
 */
function getExpertBySlug(expertSlug: string): InvestmentExpert {
  const expert = investmentExperts.find(e => e.slug === expertSlug) as InvestmentExpert;
  if (!expert) {
    throw new Error(`Expert with slug "${expertSlug}" not found`);
  }
  return expert;
}

/**
 * Generates expert response using AI
 * @param expert - Expert data
 * @param originalIdea - Original business idea
 * @param projectDocument - Project document
 * @param chatHistory - Chat history
 * @param selectedModel - AI model to use
 * @returns Expert chat response
 */
async function generateExpertResponse(
  expert: InvestmentExpert,
  originalIdea: string,
  projectDocument: string,
  chatHistory: string,
  selectedModel?: AvailableModel,
  language?: string,
): Promise<ExpertChatResponse> {
  const expertiseList = Array.isArray(expert.expertise)
    ? expert.expertise.join(', ')
    : expert.expertise;

  console.log(`=== RAG EXPERT ANALYSIS FOR ${expert.slug.toUpperCase()} ===`);

  try {
    // 1. Get RAG context for this expert
    const projectData = {
      originalIdea,
      projectDocument,
      chatHistory,
      expertName: expert.name,
      expertFund: expert.fund,
      expertFocus: expert.focus,
    };

    const collectionName = expert.collection || expert.slug;

    // Import ragAnalyzer to get context without full analysis
    const { ragAnalyzer } = await import('@/lib/rag');
    const ragResult = await ragAnalyzer.analyzeStartup(projectData, collectionName);

    console.log('RAG Context retrieved:', {
      expertSlug: expert.slug,
      ragContextChunks: ragResult.context.length,
      ragTokens: ragResult.totalTokens,
      processingTime: ragResult.processingTime,
    });

    // 2. Create enhanced chat history with RAG context
    const ragContext = ragAnalyzer.createPromptContext(ragResult.context);
    const enhancedChatHistory = `${chatHistory}

RAG CONTEXT FROM ${expert.name.toUpperCase()} KNOWLEDGE BASE:
${ragContext}

Based on this context from your knowledge base, please provide your expert analysis.`;

    // 3. Generate expert response using standard prompt with RAG context and language requirements
    const availableExperts = investmentExperts.map(e => ({
      name: e.name,
      slug: e.slug,
      fund: e.fund,
    }));

    const prompt = getExpertChatPrompt({
      expertName: expert.name,
      expertFund: expert.fund,
      expertMethodology: expert.methodology,
      expertExpertise: expertiseList,
      expertFocus: expert.focus,
      originalIdea: originalIdea,
      projectDocument: projectDocument,
      chatHistory: enhancedChatHistory,
      availableExperts: availableExperts,
      language: language,
    });

    const result = await generateExpertChatResponse(prompt, selectedModel);

    // Add RAG metadata to the result
    const enhancedResult = {
      ...result.result,
      ragMetadata: {
        contextChunks: ragResult.context.length,
        totalTokens: ragResult.totalTokens,
        processingTime: ragResult.processingTime,
      },
    };

    return enhancedResult;
  } catch (error) {
    console.error(`RAG analysis failed for expert ${expert.slug}:`, error);

    // Fallback to standard expert generation without RAG
    console.log('Falling back to standard expert generation...');

    const availableExperts = investmentExperts.map(e => ({
      name: e.name,
      slug: e.slug,
      fund: e.fund,
    }));

    const prompt = getExpertChatPrompt({
      expertName: expert.name,
      expertFund: expert.fund,
      expertMethodology: expert.methodology,
      expertExpertise: expertiseList,
      expertFocus: expert.focus,
      originalIdea: originalIdea,
      projectDocument: projectDocument,
      chatHistory: chatHistory,
      availableExperts: availableExperts,
      language: language,
    });

    const result = await generateExpertChatResponse(prompt, selectedModel);
    return result.result;
  }
}

/**
 * Creates expert message from response
 * @param sessionId - Chat session ID
 * @param expert - Expert data
 * @param response - Expert chat response
 * @param processingTime - Time taken to generate response
 * @returns Expert message
 */
function createExpertMessage(
  sessionId: string,
  expert: InvestmentExpert,
  response: ExpertChatResponse,
  processingTime: number,
): ChatMessage {
  return {
    id: nanoid(12),
    chatId: sessionId,
    expertId: expert.slug,
    content: response.message,
    timestamp: new Date(),
    type: 'expert',
    status: 'sent',
    metadata: {
      confidence: response.confidence,
      processingTime,
      nextSpeaker: response.nextSpeaker,
      investmentInterest: response.investmentInterest,
      recommendations: response.recommendations,
    },
  };
}

/**
 * Creates fallback expert message for errors
 * @param sessionId - Chat session ID
 * @param expert - Expert data
 * @param processingTime - Time taken
 * @returns Fallback message
 */
function createFallbackMessage(
  sessionId: string,
  expert: InvestmentExpert,
  processingTime: number,
): ChatMessage {
  return {
    id: nanoid(12),
    chatId: sessionId,
    expertId: expert.slug,
    content: `I'm having trouble analyzing this right now. Could you please rephrase your question or provide more details?`,
    timestamp: new Date(),
    type: 'expert',
    status: 'sent',
    metadata: {
      confidence: 0,
      reasoning: 'Fallback response due to AI error',
      processingTime,
    },
  };
}

/**
 * User message analysis response interface
 */
interface UserMessageAnalysis {
  assistantMessage: string;
  actionType: 'expert_specific' | 'expert_all' | 'document_update' | 'general' | 'combined';
  targetedExperts?: string[];
  documentUpdateRequest?: string;
  nextSpeakers: string[];
  confidence: number;
  reasoning: string;
}

/**
 * Analyzes user message and determines appropriate actions
 * @param session - Chat session data
 * @param userMessage - User's message
 * @param selectedModel - AI model to use
 * @returns Analysis result
 */
async function analyzeUserMessage(
  session: ChatSession,
  userMessage: string,
  selectedModel?: AvailableModel,
): Promise<UserMessageAnalysis> {
  const availableExperts = investmentExperts
    .filter(e => session.experts.includes(e.slug))
    .map(e => `${e.name} (@${e.slug}) - ${e.fund}`)
    .join('\n');

  const chatHistory = formatChatHistoryForPrompt(
    session.messages.map(m => ({
      type: m.type,
      content: m.content,
      expertId: m.expertId,
      timestamp: m.timestamp,
      userReaction: m.userReaction,
    })),
  );

  const prompt = getUserMessageHandlerPrompt({
    originalIdea: session.originalIdea,
    projectDocument: session.projectDocument || 'No document created yet',
    chatHistory,
    userMessage,
    availableExperts,
  });

  try {
    const result = await generateExpertChatResponse(prompt, selectedModel);
    return result.result as unknown as UserMessageAnalysis;
  } catch (error) {
    console.error('Failed to analyze user message:', error);
    // Fallback to generic response
    return {
      assistantMessage: 'I understand your message. Let me have the experts respond.',
      actionType: 'expert_all',
      nextSpeakers: session.experts,
      confidence: 50,
      reasoning: 'Fallback response due to analysis error',
    };
  }
}

/**
 * Processes document update request
 * @param session - Chat session data
 * @param updateRequest - Description of what to update
 * @param selectedModel - AI model to use
 * @returns Updated document and assistant message
 */
async function processDocumentUpdate(
  session: ChatSession,
  updateRequest: string,
  selectedModel?: AvailableModel,
): Promise<{ updatedDocument: string; assistantMessage: string }> {
  try {
    const result = await generateDocumentUpdate(
      session.projectDocument || '',
      updateRequest,
      formatChatHistoryForPrompt(
        session.messages.map(m => ({
          type: m.type,
          content: m.content,
          expertId: m.expertId,
          timestamp: m.timestamp,
          userReaction: m.userReaction,
        })),
      ),
      selectedModel,
    );

    return {
      updatedDocument: result.updatedDocument,
      assistantMessage: result.assistantMessage,
    };
  } catch (error) {
    console.error('Failed to update document:', error);
    throw new Error('Document update failed');
  }
}

/**
 * POST /api/chats/[id]/messages - Send message and get expert responses
 */
export const POST = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;
  const body = await request.json();
  const validatedData = ValidationSchemas.message.create.parse(body);
  const { content, type, expertId, selectedModel } = validatedData;

  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  if (type === 'user') {
    // Step 1: Add user message to session
    const userMessage = createUserMessage(sessionId, content, type, expertId);
    addMessageToSession(sessionId, userMessage);

    // Step 2: Analyze user message through assistant
    console.log('Analyzing user message through assistant...');
    const analysis = await analyzeUserMessage(session, content, selectedModel as AvailableModel);

    console.log('User message analysis result:', analysis);

    const responseData: {
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
      expertResponses?: ChatMessage[];
      updatedDocument?: string;
      nextSpeakers: string[];
    } = {
      userMessage,
      assistantMessage: createUserMessage(
        sessionId,
        analysis.assistantMessage,
        'expert',
        'assistant',
      ),
      nextSpeakers: analysis.nextSpeakers,
    };

    // Step 3: Add assistant message to session
    addMessageToSession(sessionId, responseData.assistantMessage);

    // Step 4: Handle different action types
    switch (analysis.actionType) {
      case 'expert_all':
        console.log('Processing expert_all action - adding all experts to queue');
        // Don't generate responses immediately, the queue system will handle this
        break;

      case 'expert_specific':
        if (analysis.targetedExperts && analysis.targetedExperts.length > 0) {
          console.log(
            `Processing expert_specific action for: ${analysis.targetedExperts.join(', ')} - adding to queue`,
          );
          // Don't generate responses immediately, the queue system will handle this
        }
        break;

      case 'document_update':
        if (analysis.documentUpdateRequest) {
          console.log('Processing document_update action');
          const documentResult = await processDocumentUpdate(
            session,
            analysis.documentUpdateRequest,
            selectedModel as AvailableModel,
          );

          responseData.updatedDocument = documentResult.updatedDocument;

          // Update session with new document
          updateChatSession(sessionId, {
            projectDocument: documentResult.updatedDocument,
            updatedAt: new Date(),
          });

          // Create document update message
          const documentUpdateMessage = createUserMessage(
            sessionId,
            documentResult.assistantMessage,
            'expert',
            'assistant',
          );
          addMessageToSession(sessionId, documentUpdateMessage);
        }
        break;

      case 'combined':
        // Handle document update first, then experts
        if (analysis.documentUpdateRequest) {
          console.log('Processing combined action: document update');
          const documentResult = await processDocumentUpdate(
            session,
            analysis.documentUpdateRequest,
            selectedModel as AvailableModel,
          );

          responseData.updatedDocument = documentResult.updatedDocument;

          // Update session with new document
          updateChatSession(sessionId, {
            projectDocument: documentResult.updatedDocument,
            updatedAt: new Date(),
          });

          // Create document update message
          const documentUpdateMessage = createUserMessage(
            sessionId,
            documentResult.assistantMessage,
            'expert',
            'assistant',
          );
          addMessageToSession(sessionId, documentUpdateMessage);
        }

        // Then handle experts - they will be handled by the queue system
        if (analysis.targetedExperts && analysis.targetedExperts.length > 0) {
          console.log(
            `Processing combined action: experts ${analysis.targetedExperts.join(', ')} - adding to queue`,
          );
          // Don't generate responses immediately, the queue system will handle this
        }
        break;

      case 'general':
        console.log('Processing general action - no additional responses needed');
        break;

      default:
        console.log('Unknown action type, no additional processing');
    }

    return responseData;
  }

  if (type === 'expert' && expertId) {
    // Generate response for single expert (for queue processing)
    const expert = getExpertBySlug(expertId);
    const chatHistory = formatChatHistory(session.messages);
    const projectDocument = session.projectDocument || 'No document created yet';

    console.log(`Generating single expert response for: ${expertId}`);

    try {
      const expertResponse = await generateExpertResponse(
        expert,
        session.originalIdea,
        projectDocument,
        chatHistory,
        selectedModel as AvailableModel,
        session.language,
      );

      const expertMessage = createExpertMessage(sessionId, expert, expertResponse, Date.now());

      // Add expert response to session
      addMessageToSession(sessionId, expertMessage);

      return {
        message: expertMessage,
      };
    } catch (error) {
      console.error(`Failed to generate response for expert ${expertId}:`, error);

      const fallbackMessage = createFallbackMessage(sessionId, expert, Date.now());
      addMessageToSession(sessionId, fallbackMessage);

      return {
        message: fallbackMessage,
      };
    }
  }

  // Fallback for other message types
  const userMessage = createUserMessage(sessionId, content, type, expertId);
  addMessageToSession(sessionId, userMessage);
  return { message: userMessage };
});

/**
 * GET /api/chats/[id]/messages - Get all messages for session
 */
export const GET = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;

  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  return {
    messages: session.messages,
    sessionId: session.id,
    status: session.status,
    messageCount: session.messages.length,
  };
});
