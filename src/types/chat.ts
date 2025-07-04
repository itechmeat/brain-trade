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

export interface MessageMetadata {
  reasoning?: string;
  sources?: string[];
  processingTime?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  originalIdea: string;
  expertId: string; // Single expert ID for 1:1 chat
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  tags?: string[];
  language?: string; // Detected language for consistent responses (e.g., "English", "Russian", "Spanish")
}

export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
}

// Expert chat response type is exported from @/types/ai

export interface ChatContext {
  originalIdea: string;
  messageHistory: ChatMessage[];
}

export type MessageType = 'user' | 'expert' | 'system';
export type ChatStatus = 'active' | 'completed' | 'archived';
