import { ChatMessage, ChatSession, InvestmentExpert } from '@/types';
import investmentExperts from '@/data/investment_experts.json';

// Mock experts are already in JSON file
export const mockExperts: InvestmentExpert[] = investmentExperts as InvestmentExpert[];

// Mock chat messages
export const createMockMessages = (idea: string, chatId: string): ChatMessage[] => {
  const baseMessages: ChatMessage[] = [
    {
      id: 'user-1',
      chatId,
      content: idea,
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      type: 'user',
    },

    {
      id: 'system-1',
      chatId,
      content: 'Expert is analyzing your idea...',
      timestamp: new Date(Date.now() - 110000),
      type: 'system',
    },
  ];

  // Add expert's response (single expert now)
  const expertResponse: ChatMessage = {
    id: 'ben-1',
    chatId,
    expertId: 'bhorowitz',
    content: `Interesting idea! Analyzing from a team management and scaling perspective, I see the following key points:

1. **Team**: It's critical to assemble a team with experience in this field
2. **Market**: The addressable market size allows for significant business creation
3. **Execution**: Focus on execution and metrics will be key success factors

I recommend focusing on finding product-market fit before scaling.`,
    timestamp: new Date(Date.now() - 90000),
    type: 'expert',
    metadata: {
      reasoning: 'Based on a16z investment experience in similar projects',
    },
  };

  return [...baseMessages, expertResponse];
};

// Creating mock chat session (simplified - single expert conversation)
export const createMockChatSession = (
  idea: string,
  expertId: string = 'bhorowitz',
): ChatSession => {
  const chatId = `chat-${Date.now()}`;

  return {
    id: chatId,
    title: idea.length > 50 ? idea.substring(0, 50) + '...' : idea,
    originalIdea: idea,
    expertId: expertId, // Single expert ID for 1:1 chat
    messages: [], // Start with empty messages
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    tags: ['startup', 'idea-validation'],
  };
};

// Helpers for working with mock data
export const mockUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  async simulateExpertResponse(
    expertSlug: string,
    content: string,
    chatId: string,
  ): Promise<ChatMessage> {
    await this.delay(2000 + Math.random() * 3000); // 2-5 seconds delay

    return {
      id: `${expertSlug}-${Date.now()}`,
      chatId,
      expertId: expertSlug,
      content,
      timestamp: new Date(),
      type: 'expert',
      metadata: {
        processingTime: 2000 + Math.random() * 3000,
      },
    };
  },
};
