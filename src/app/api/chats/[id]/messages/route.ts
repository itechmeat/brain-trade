import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

import { createAPIHandlerWithParams } from '@/lib/api/base-handler';
import { ValidationSchemas } from '@/lib/validations';
import { getChatSession, updateChatSession } from '@/lib/chat-utils';
import { generateExpertChatResponse } from '@/lib/api/ai-utils';
import { getExpertChatPrompt } from '@/lib/prompts';
import investmentExperts from '@/data/investment_experts.json';

import { ChatMessage } from '@/types/chat';
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
 * @param originalIdea - Original topic/idea
 * @param chatHistory - Chat history
 * @param selectedModel - AI model to use
 * @returns Expert chat response
 */
async function generateExpertResponse(
  expert: InvestmentExpert,
  originalIdea: string,
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
      chatHistory,
      expertName: expert.name,
      expertFund: expert.fund,
      expertFocus: expert.focus,
    };

    const collectionName = expert.collection || expert.slug;

    // Import ragAnalyzer to get context without full analysis
    const { ragAnalyzer } = await import('@/lib/rag');
    const ragResult = await ragAnalyzer.analyzeStartup(projectData, collectionName);

    console.log('✅ RAG Context retrieved:', {
      expertSlug: expert.slug,
      collectionName,
      ragContextChunks: ragResult.context.length,
      ragTokens: ragResult.totalTokens,
      processingTime: ragResult.processingTime,
    });

    // Log first few chunks for verification
    if (ragResult.context.length > 0) {
      console.log(
        '📄 First RAG context chunk:',
        ragResult.context[0].content.substring(0, 200) + '...',
      );
      console.log(
        '🔢 RAG chunk scores:',
        ragResult.context.slice(0, 3).map(c => c.score),
      );
      console.log(
        '📚 RAG sources:',
        ragResult.context.slice(0, 3).map(c => c.source),
      );
    }

    // 2. Create enhanced chat history with RAG context
    const ragContext = ragAnalyzer.createPromptContext(ragResult.context);
    const enhancedChatHistory = `${chatHistory}

KNOWLEDGE BASE CONTEXT:
${ragContext}`;

    // 3. Generate expert response using new prompt system (marketplace + expert system prompt)
    const expertSystemPrompt =
      expert.systemPrompt ||
      `You are ${expert.name} from ${expert.fund}. Your expertise includes: ${expertiseList}. Your focus is: ${expert.focus}.`;

    const basePrompt = getExpertChatPrompt({
      expertSystemPrompt: expertSystemPrompt,
      originalIdea: originalIdea,
      chatHistory: enhancedChatHistory,
      language: language,
    });

    // Add final language enforcement at the very end
    const prompt = `${basePrompt}

🚨🚨🚨 FINAL CRITICAL REMINDER 🚨🚨🚨
BEFORE YOU RESPOND: WHAT LANGUAGE DID THE USER WRITE IN?
YOUR RESPONSE MUST BE IN THAT EXACT SAME LANGUAGE!
🚨🚨🚨 RESPOND IN USER'S LANGUAGE 🚨🚨🚨`;

    console.log('🤖 Sending enhanced prompt to LLM with RAG context...');
    console.log('📝 Enhanced prompt length:', prompt.length);
    console.log('🧠 Using model:', selectedModel || 'default');

    const result = await generateExpertChatResponse(prompt, selectedModel);

    console.log('✅ LLM Response received with RAG enhancement');
    console.log('💬 Response preview:', result.result.message.substring(0, 100) + '...');

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
    console.error(`❌ RAG analysis failed for expert ${expert.slug}:`, error);

    // Fallback to standard expert generation without RAG
    console.log('⚠️ Falling back to standard expert generation WITHOUT RAG...');

    const expertSystemPrompt =
      expert.systemPrompt ||
      `You are ${expert.name} from ${expert.fund}. Your expertise includes: ${expertiseList}. Your focus is: ${expert.focus}.`;

    const prompt = getExpertChatPrompt({
      expertSystemPrompt: expertSystemPrompt,
      originalIdea: originalIdea,
      chatHistory: chatHistory,
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
      processingTime,
      ...(response.ragMetadata && { ragMetadata: response.ragMetadata }),
    },
  };
}

/**
 * Creates fallback expert message for errors
 * @param sessionId - Chat session ID
 * @param expert - Expert data
 * @param processingTime - Time taken
 * @param sessionLanguage - Session language for localized fallback
 * @returns Fallback message
 */
function createFallbackMessage(
  sessionId: string,
  expert: InvestmentExpert,
  processingTime: number,
  sessionLanguage?: string,
): ChatMessage {
  // Provide fallback messages in multiple languages
  const fallbackMessages: Record<string, string> = {
    Russian:
      'У меня сейчас проблемы с анализом. Не могли бы вы перефразировать вопрос или предоставить больше деталей?',
    English:
      "I'm having trouble analyzing this right now. Could you please rephrase your question or provide more details?",
    Spanish:
      '¿Tengo problemas para analizar esto ahora mismo. ¿Podrías reformular tu pregunta o proporcionar más detalles?',
    French:
      "J'ai des difficultés à analyser cela en ce moment. Pourriez-vous reformuler votre question ou fournir plus de détails?",
    German:
      'Ich habe gerade Probleme bei der Analyse. Könnten Sie Ihre Frage umformulieren oder mehr Details angeben?',
    Chinese: '我现在无法分析这个问题。您能重新表述一下问题或提供更多细节吗？',
    Japanese: '現在分析に問題があります。質問を言い換えるか、詳細を教えていただけますか？',
  };

  const content = fallbackMessages[sessionLanguage || 'English'] || fallbackMessages.English;

  return {
    id: nanoid(12),
    chatId: sessionId,
    expertId: expert.slug,
    content,
    timestamp: new Date(),
    type: 'expert',
    status: 'sent',
    metadata: {
      reasoning: 'Fallback response due to AI error',
      processingTime,
    },
  };
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
    // Add user message to session
    const userMessage = createUserMessage(sessionId, content, type, expertId);
    addMessageToSession(sessionId, userMessage);

    // Generate expert response directly (1:1 chat with single expert)
    const expert = getExpertBySlug(session.expertId);
    const chatHistory = formatChatHistory(session.messages);

    console.log(`Generating expert response for: ${session.expertId}`);

    try {
      const expertResponse = await generateExpertResponse(
        expert,
        session.originalIdea,
        chatHistory,
        selectedModel as AvailableModel,
        session.language,
      );

      const expertMessage = createExpertMessage(sessionId, expert, expertResponse, Date.now());

      // Add expert response to session
      addMessageToSession(sessionId, expertMessage);

      return {
        userMessage,
        expertMessage,
      };
    } catch (error) {
      console.error(`Failed to generate response for expert ${session.expertId}:`, error);

      const fallbackMessage = createFallbackMessage(
        sessionId,
        expert,
        Date.now(),
        session.language,
      );
      addMessageToSession(sessionId, fallbackMessage);

      return {
        userMessage,
        expertMessage: fallbackMessage,
      };
    }
  }

  if (type === 'expert' && expertId) {
    // Generate response for single expert (for queue processing)
    const expert = getExpertBySlug(expertId);
    const chatHistory = formatChatHistory(session.messages);
    console.log(`Generating single expert response for: ${expertId}`);

    try {
      const expertResponse = await generateExpertResponse(
        expert,
        session.originalIdea,
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

      const fallbackMessage = createFallbackMessage(
        sessionId,
        expert,
        Date.now(),
        session.language,
      );
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
