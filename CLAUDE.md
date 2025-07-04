# DeepVest Venture Chat - Project Memory

## PROJECT OVERVIEW

**Venture Chat** is an AI-powered venture capital consultation platform where users discuss business ideas with a group of virtual investment experts, receive structured feedback, and evolve projects based on expert recommendations.

### Key Features Implemented ✅

- **Dual-panel interface**: Chat (50%) + Live document (50%)
- **Real LLM integrations**: Replaced all mock data with actual API calls
- **3 Investment experts**: Ben Horowitz, Peter Thiel, Steve Blank personalities
- **Document auto-generation**: AI creates structured MD documents from ideas
- **Apply recommendations**: Real AI-powered document updates
- **Complete validation**: All APIs use ValidationSchemas with Zod
- **TypeScript strict**: Zero `any` types, full type safety

### Current Architecture

```
User Input → AI Document Creation → Expert LLM Analysis → Recommendations → Document Updates
```

### Technology Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **AI Integration**: OpenAI/Gemini via OpenRouter + custom prompt system
- **State Management**: React Query + custom useChat hook
- **Styling**: SCSS Modules + Radix UI components
- **Validation**: Zod schemas for all API endpoints
- **Database**: Qdrant vector DB (ready for RAG integration)

## CURRENT PROJECT STATUS

### ✅ COMPLETED (Major Implementation Achieved)

1. **Real LLM Integration**: All mock data replaced with actual AI API calls
2. **API Layer Complete**: All endpoints using createAPIHandler + ValidationSchemas
3. **Expert System**: 3 specialized investment experts with unique personalities
4. **Document Generation**: AI creates and updates structured business documents
5. **Apply Recommendations**: Full implementation with AI-powered document updates
6. **Type Safety**: Zero `any` types, complete TypeScript compliance
7. **Code Standards**: Full compliance with development guidelines

### ⚠️ PENDING TASKS

- **RAG Integration**: Enhance expert responses with vector knowledge base
- **Error Handling**: Comprehensive fallback mechanisms
- **Testing**: Unit and integration tests for API endpoints
- **Performance**: Query optimization and caching strategies

### 📁 KEY FILES & STRUCTURE

```
src/
├── app/api/                     # API Layer (All Real Implementation)
│   ├── chats/route.ts          # Session management
│   ├── chats/[id]/messages/    # LLM expert responses
│   ├── chats/[id]/apply-recommendations/ # AI document updates
│   ├── experts/route.ts        # Expert configurations
│   └── ideas/analyze/route.ts  # AI document generation
├── components/                  # UI Components (Complete)
│   ├── chat/ChatInterface.tsx  # Main chat UI
│   ├── document/DocumentViewer.tsx # Live document display
│   └── experts/ExpertAvatar.tsx # Expert visualization
├── hooks/useChat.ts            # State management (Real API calls)
├── lib/
│   ├── chat-utils.ts          # Session management utilities
│   ├── api/ai-utils.ts        # LLM integration utilities
│   ├── prompts.ts             # Expert and document prompts
│   └── validations/           # Zod schemas for all APIs
└── types/                      # Complete TypeScript definitions
```

## CRITICAL RULES - ALWAYS FOLLOW

### Language Requirements

- **ABSOLUTELY FORBIDDEN**: Russian language in code, comments, console.log, strings, or any code-related text
- **MANDATORY**: All code, comments, variable names, function names, UI text, error messages in English only
- **DOCUMENTATION**: Documentation files (.md) can be in any language as needed
- **USER INTERFACE**: All user-facing text must be in English
- **CRITICAL**: NEVER mention specific languages (Italian, Spanish, etc.) in prompts or user-facing text
- **USE GENERIC TERMS**: "user's language", "original language", "target language" instead of specific language names
- **VIOLATION = IMMEDIATE FIX REQUIRED**

### Git Operations - STRICTLY FORBIDDEN

- **ABSOLUTELY FORBIDDEN**: Any git commands (git add, git commit, git push, git pull, etc.)
- **NO GIT ACTIONS**: Do not use git tools or commands under any circumstances
- **EXPLANATION**: Git operations are handled by the user manually
- **VIOLATION = IMMEDIATE STOP**: If asked to use git, politely decline and explain

### API Development - MANDATORY PATTERNS

#### 1. ALWAYS use createAPIHandler for API routes

```typescript
//  CORRECT
export const GET = createAPIHandler(async (request, params) => {
  // implementation
});

// L FORBIDDEN - direct NextRequest handling
export async function GET(request: NextRequest) {
  // manual CORS, auth, error handling
}
```

#### 2. ALWAYS use ValidationSchemas

```typescript
//  CORRECT
const validatedData = ValidationSchemas.project.create.parse(body);

// L FORBIDDEN - manual validation
if (!body.name) {
  return NextResponse.json({ error: 'Name required' });
}
```

#### 3. Single Responsibility Principle

- **Maximum 20-30 lines per function**
- **Break large functions into smaller helpers**
- **One clear purpose per function**

### TypeScript Rules - ZERO TOLERANCE

#### NO `any` types EVER

```typescript
// L FORBIDDEN
function processData(data: any) {}

//  CORRECT
function processData(data: unknown) {}
function processTypedData<T extends Record<string, unknown>>(data: T) {}
```

### Import Order - MANDATORY

```typescript
// 1. React & Next.js
import React from 'react';
import { NextRequest } from 'next/server';

// 2. External libraries
import { z } from 'zod';

// 3. Internal modules (absolute paths)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 4. Relative imports
import './styles.css';

// 5. Types (at the end)
import type { User } from '@/types/user';
```

### Component Rules

#### File Structure - MANDATORY

```
components/
   ui/
      Button/
         Button.tsx
         Button.module.scss
```

#### NO inline styles in JSX

```typescript
// L FORBIDDEN
<div style={{ padding: '16px', backgroundColor: 'red' }}>

//  CORRECT
import styles from './Card.module.scss';
<div className={styles.card}>
```

### JSDoc Documentation - REQUIRED for all functions

```typescript
/**
 * Creates new project with data validation
 * @param projectData - Project data for creation
 * @param userId - ID of user creating project
 * @returns Promise with created project or error
 * @throws {ValidationError} When project data is invalid
 */
async function createProject(projectData: CreateProjectData, userId: string) {
  // implementation
}
```

### Security Rules - CRITICAL

#### 1. ALWAYS require auth in protected APIs

```typescript
export const POST = createAPIHandler(async request => {
  const user = await requireAuth(request); // Throws if not authenticated
  // logic...
});
```

#### 2. ALWAYS validate permissions

```typescript
await requireProjectPermission(user.id, projectId, 'editor');
```

#### 3. NEVER hardcode secrets

```typescript
// L FORBIDDEN
const apiKey = 'sk-1234567890abcdef';

//  CORRECT
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}
```

### Error Handling - MANDATORY PATTERNS

#### API Errors

```typescript
//  CORRECT - use APIError class
throw new APIError('User not found', 404);
throw new APIError('Validation failed', 400);
```

#### Response Format

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime: number;
    [key: string]: any;
  };
}
```

### File Organization Rules

#### Barrel Exports Required

```typescript
// components/forms/index.ts
export { StyledInput } from './StyledInput';
export { FormField } from './FormField';
```

#### NO deep imports

```typescript
// L FORBIDDEN
import { StyledInput } from '@/components/forms/StyledInput/StyledInput';

//  CORRECT
import { StyledInput } from '@/components/forms';
```

### Database Rules

#### Repository Pattern MANDATORY

```typescript
//  CORRECT - through repository
class ProjectRepository extends BaseRepository<Project> {
  async findBySlug(slug: string) {
    const supabase = await this.getClient();
    return this.handleQuery(supabase.from(this.tableName).select('*').eq('slug', slug));
  }
}

// L FORBIDDEN - direct queries in components
const { data } = await supabase.from('projects').select('*');
```

### Performance Rules

#### React Query Standards

```typescript
//  CORRECT
const { data } = useApiQuery<Project>(`/projects/${projectId}`);

// Query Keys Structure
const QUERY_KEYS = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => [...QUERY_KEYS.projects.all, 'detail', id] as const,
  },
} as const;
```

## CRITICAL VIOLATIONS THAT BLOCK MERGE

1. Russian language anywhere in code
2. Using `any` types
3. Not using createAPIHandler for API routes
4. Not using ValidationSchemas
5. Hardcoded secrets/config
6. Missing authentication/permission checks
7. Inline styles in JSX
8. Functions longer than 30 lines without breaking down
9. Missing JSDoc for public functions
10. Deep imports instead of barrel exports
11. **Using git commands or operations** (STRICTLY FORBIDDEN)

## BUILD & LINT REQUIREMENTS

- **MUST pass**: `npm run lint` with zero errors
- **MUST pass**: `npm run build` with zero errors
- **MUST pass**: TypeScript compilation with strict mode
- **Zero tolerance**: for any violations of these rules

## PROJECT CONTEXT

This is a **Venture Chat** project - an AI-powered platform where investment experts provide feedback on business ideas through:

- Real LLM integrations (OpenAI, Gemini)
- RAG system with Qdrant
- React Query for state management
- Next.js 15 App Router
- TypeScript with strict types
- SCSS Modules for styling

## KEY REMINDER

**EVERY TIME** you write code, CHECK:

1. Is it in English? 
2. Using createAPIHandler? 
3. Using ValidationSchemas? 
4. No `any` types? 
5. Function under 30 lines? 
6. JSDoc documentation? 
7. Proper imports order? 
8. Using SCSS modules? 

**These rules are MANDATORY and NON-NEGOTIABLE.**

## EXPERT PERSONALITIES & IMPLEMENTATION

### Investment Experts (Fully Implemented)

1. **Ben Horowitz** (Andreessen Horowitz)
   - **Focus**: Execution & Team Building
   - **Style**: Direct, practical, execution-focused
   - **Questions**: "How will you execute this vision?"

2. **Peter Thiel** (Founders Fund)
   - **Focus**: Breakthrough Innovation & Monopoly Creation
   - **Style**: Contrarian, philosophical, big-picture thinking
   - **Questions**: "What do you believe that others don't?"

3. **Steve Blank** (Lean Startup Methodology)
   - **Focus**: Customer Development & Lean Startup
   - **Style**: Methodical, customer-centric, hypothesis-driven
   - **Questions**: "Who exactly is your customer?"

### AI Integration Details

- **Models**: OpenAI GPT-4, Google Gemini via OpenRouter
- **Prompt System**: Custom prompts for each expert personality
- **Document Generation**: AI creates structured business documents
- **Apply Recommendations**: AI updates documents based on expert advice
- **Fallback**: Mock responses if API fails (seamless UX)

## RECENT MAJOR CHANGES

### Latest Session Achievements ✅

1. **Replaced All Mock Data**: Complete LLM integration implementation
2. **Fixed All Linter Errors**: Zero TypeScript `any` types, proper imports
3. **Development Guidelines Compliance**: All code follows strict standards
4. **Build Success**: Project compiles and runs without errors
5. **API Layer Complete**: All endpoints use createAPIHandler + ValidationSchemas
6. **Russian Language Removal**: All text translated to English

### Key Implementation Files Modified

- `/src/app/api/*` - All API routes with real LLM integration
- `/src/hooks/useChat.ts` - Real API calls instead of mocks
- `/src/lib/chat-utils.ts` - Session management utilities
- `/src/lib/validations/index.ts` - Centralized Zod schemas

## ENVIRONMENT & RUNNING

### Development Commands

```bash
npm run dev          # Development server on port 3200
npm run build        # Production build (MUST pass)
npm run lint         # Linter check (MUST pass with zero errors)
```

### Environment Variables Required

```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
```

### Project Context Notes

- **Port**: 3200 for development
- **No Database**: Using in-memory storage (Map) for sessions
- **No Authentication**: Open access for MVP
- **Dual Panel**: 50/50 chat and document layout
- **Real-time**: Live document updates when applying recommendations

## IMMEDIATE CONTEXT UNDERSTANDING

**WHAT THIS PROJECT IS**: A sophisticated AI-powered venture capital consultation platform where users interact with 3 distinct investment expert personalities (Ben Horowitz, Peter Thiel, Steve Blank) who provide real analysis of business ideas through LLM integration.

**CURRENT STATE**: Fully functional MVP with real AI integration, complete UI, and successful build. All mock data has been replaced with actual API calls to LLM providers.

**NEXT STEPS**: RAG integration for enhanced expert knowledge, comprehensive error handling, and performance optimization.

**MY ROLE**: Maintain and enhance this AI consultation platform while strictly following development guidelines and ensuring zero tolerance for any violations.
