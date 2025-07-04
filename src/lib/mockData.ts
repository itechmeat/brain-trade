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
      content: 'Experts are analyzing your idea...',
      timestamp: new Date(Date.now() - 110000),
      type: 'system',
    },
  ];

  // Add expert's responses
  const expertResponses: ChatMessage[] = [
    {
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
        confidence: 0.85,
        reasoning: 'Based on a16z investment experience in similar projects',
      },
    },
    {
      id: 'peter-1',
      chatId,
      expertId: 'peterthiel',
      content: `From the position of creating monopoly and breakthrough innovations:

**Competitive advantages:**
- Do you have unique technology or approach?
- Can you create a protective moat around the business?

**0-to-1 innovation:**
Does your idea solve a problem in a fundamentally new way or improve existing solution? Fundamental novelty is needed to create significant value.

**Monopolization strategy:**
Start with a small market where you can dominate, then expand.`,
      timestamp: new Date(Date.now() - 60000),
      type: 'expert',
      metadata: {
        confidence: 0.78,
        reasoning: 'Applying Founders Fund principles for breakthrough potential assessment',
      },
    },
    {
      id: 'steve-1',
      chatId,
      expertId: 'sgblank',
      content: `Applying Customer Development methodology:

**Hypotheses to test:**
1. Does the problem really exist for the target audience?
2. Does your solution solve this problem well enough?
3. Are customers willing to pay for this solution?

**Next steps:**
- Conduct 100+ interviews with potential customers
- Create MVP to test core hypotheses
- Measure engagement and willingness to pay

Remember: in 90% of cases, the initial idea will change after customer meetings.`,
      timestamp: new Date(Date.now() - 30000),
      type: 'expert',
      metadata: {
        confidence: 0.92,
        reasoning: 'Standard Customer Development approach for validation',
      },
    },
    {
      id: 'assistant-1',
      chatId,
      expertId: 'assistant',
      content: `Great insights from all three experts! To summarize the key themes:

• **Execution focus** (Ben): Team building and operational discipline are critical
• **Monopoly potential** (Peter): Need unique competitive advantage and market creation
• **Customer validation** (Steve): Must validate problem-solution fit through interviews

Would you like to dive deeper into any of these areas, or do you have specific questions about implementing these recommendations?`,
      timestamp: new Date(Date.now() - 10000),
      type: 'expert',
      metadata: {
        confidence: 0.95,
        reasoning: 'Facilitating conversation flow and providing helpful summary',
      },
    },
  ];

  return [...baseMessages, ...expertResponses];
};

// Creating mock chat session (simplified - no initial expert responses)
export const createMockChatSession = (idea: string): ChatSession => {
  const chatId = `chat-${Date.now()}`;

  return {
    id: chatId,
    title: idea.length > 50 ? idea.substring(0, 50) + '...' : idea,
    originalIdea: idea,
    experts: ['bhorowitz', 'peterthiel', 'sgblank'], // expert slugs
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
        confidence: 0.7 + Math.random() * 0.3, // 70-100%
        processingTime: 2000 + Math.random() * 3000,
      },
    };
  },
};
