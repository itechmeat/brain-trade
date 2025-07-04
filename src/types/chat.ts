export interface ChatMessage {
  id: string;
  chatId: string;
  expertId?: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'expert' | 'system';
  status?: 'sending' | 'sent' | 'error';
  metadata?: MessageMetadata;
  userReaction?: 'like' | 'dislike' | null;
}

export interface RecommendationItem {
  id: string;
  text: string;
  selected: boolean;
  applied: boolean; // Whether this recommendation has already been applied
}

export interface MessageMetadata {
  confidence?: number;
  reasoning?: string;
  sources?: string[];
  processingTime?: number;
  nextSpeaker?: string | null;
  investmentInterest?: number;
  recommendations?: string[]; // Array of specific actionable recommendations (legacy)
  recommendationItems?: RecommendationItem[]; // New structured recommendations with selection state
}

export interface ChatSession {
  id: string;
  title: string;
  originalIdea: string;
  experts: string[]; // Array of expert IDs
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  tags?: string[];
  projectDocument?: string; // MD format document that evolves during conversation
  messageQueue?: string[]; // Queue of speaker slugs for sequential messaging
  isProcessingQueue?: boolean; // Flag to track if queue is being processed
  language?: string; // Detected language for consistent responses (e.g., "English", "Russian", "Spanish")
  appliedRecommendations?: string[]; // Array of recommendation texts that have been applied
}

export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
}

// Expert chat response type is exported from @/types/ai

// Types for assistant chat responses
export interface AssistantChatResponse {
  message: string;
  nextSpeaker?: string | null; // slug of next speaker or 'user' or null for open discussion
  actionType: 'summary' | 'clarification' | 'direction' | 'tracking' | 'none';
  hasActionItems: boolean; // true if message highlights specific action items or recommendations
}

export interface ChatContext {
  originalIdea: string;
  messageHistory: ChatMessage[];
  currentSpeaker?: string; // slug of current expert
  discussionPhase: 'initial_analysis' | 'q_and_a' | 'expert_discussion' | 'final_recommendations';
}

export type MessageType = 'user' | 'expert' | 'system';
export type ChatStatus = 'active' | 'completed' | 'archived';
