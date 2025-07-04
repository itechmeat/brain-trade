import { z } from 'zod';

/**
 * Central validation schemas for the entire application
 * All API endpoints and forms must use these schemas
 */

// Chat related schemas
export const chatCreateSchema = z.object({
  originalIdea: z.string().min(10, 'Original idea must be at least 10 characters'),
  experts: z.array(z.string()).min(1, 'At least one expert is required'),
  language: z.string().optional(),
});

export const messageCreateSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  type: z.enum(['user', 'expert', 'system']).default('user'),
  expertId: z.string().optional(),
  selectedModel: z.string().optional(),
});

export const applyRecommendationsSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  selectedRecommendations: z
    .array(z.string())
    .min(1, 'At least one recommendation must be selected'),
  selectedModel: z.string().optional(),
});

// Ideas and documents schemas
export const ideaAnalysisSchema = z.object({
  idea: z.string().min(10, 'Idea must be at least 10 characters long'),
  selectedModel: z.string().optional(),
});

// Expert related schemas
export const expertRequestSchema = z.object({
  expertSlugs: z.array(z.string()).min(1, 'At least one expert slug is required'),
  includePrompts: z.boolean().default(false),
});

// RAG analysis schema
export const ragAnalysisSchema = z.object({
  projectData: z.record(z.unknown()),
  expertSlug: z.string(),
  selectedModel: z.string(),
});

/**
 * Centralized validation schemas object
 * Use this in all API endpoints and forms
 */
export const ValidationSchemas = {
  chat: {
    create: chatCreateSchema,
  },
  message: {
    create: messageCreateSchema,
  },
  recommendations: {
    apply: applyRecommendationsSchema,
  },
  idea: {
    analyze: ideaAnalysisSchema,
  },
  expert: {
    request: expertRequestSchema,
  },
  rag: {
    analyze: ragAnalysisSchema,
  },
} as const;

// Export inferred types for use in components and API handlers
export type ChatCreateForm = z.infer<typeof chatCreateSchema>;
export type MessageCreateForm = z.infer<typeof messageCreateSchema>;
export type ApplyRecommendationsForm = z.infer<typeof applyRecommendationsSchema>;
export type IdeaAnalysisForm = z.infer<typeof ideaAnalysisSchema>;
export type ExpertRequestForm = z.infer<typeof expertRequestSchema>;
export type RagAnalysisForm = z.infer<typeof ragAnalysisSchema>;
