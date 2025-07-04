# Этап 6: Типизация и модели данных

## Создание TypeScript типов для чатов и экспертов

### Шаг 6.1: Базовые типы для AI и моделей
- [ ] Скопировать и адаптировать `src/types/ai.ts` из venture-agent
- [ ] Добавить типы для различных LLM провайдеров:
  - OpenAI модели
  - Anthropic Claude модели  
  - Google Gemini модели
- [ ] Создать интерфейсы для:
  - AI сообщений (роли, контент)
  - Конфигурации моделей
  - Параметров генерации

### Шаг 6.2: Типы для экспертов
- [ ] Скопировать и адаптировать `src/types/expert.ts`
- [ ] Расширить типы для множественных экспертов:
  ```typescript
  interface Expert {
    id: string;
    name: string;
    avatar: string;
    expertise: string[];
    description: string;
    systemPrompt: string;
    model: AIModel;
    isActive: boolean;
  }
  ```

### Шаг 6.3: Типы для чатов и сообщений
- [ ] Создать `src/types/chat.ts` с интерфейсами:
  ```typescript
  interface Chat {
    id: string;
    title: string;
    participants: Expert[];
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface Message {
    id: string;
    chatId: string;
    role: 'user' | 'assistant';
    content: string;
    expertId?: string; // Для сообщений от экспертов
    timestamp: Date;
    metadata?: MessageMetadata;
  }
  
  interface MessageMetadata {
    model?: string;
    tokens?: number;
    processingTime?: number;
    ragSources?: RAGSource[];
  }
  ```

### Шаг 6.4: Типы для RAG системы
- [ ] Создать `src/types/rag.ts` с интерфейсами:
  ```typescript
  interface RAGSource {
    id: string;
    content: string;
    score: number;
    expertId: string;
    metadata: Record<string, any>;
  }
  
  interface RAGQuery {
    query: string;
    expertIds?: string[];
    limit?: number;
    threshold?: number;
  }
  
  interface RAGResult {
    sources: RAGSource[];
    totalFound: number;
    processingTime: number;
  }
  ```

### Шаг 6.5: Типы для API запросов и ответов
- [ ] Создать `src/types/api.ts` с интерфейсами:
  ```typescript
  interface ChatRequest {
    message: string;
    chatId?: string;
    expertIds: string[];
    model?: string;
    useRAG?: boolean;
  }
  
  interface ChatResponse {
    chatId: string;
    messages: ExpertMessage[];
    ragSources?: RAGSource[];
  }
  
  interface ExpertMessage {
    expertId: string;
    content: string;
    metadata: MessageMetadata;
  }
  ```

### Шаг 6.6: Утилитарные типы и перечисления
- [ ] Создать перечисления для:
  ```typescript
  enum AIProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GOOGLE = 'google'
  }
  
  enum ExpertRole {
    BUSINESS_ANALYST = 'business_analyst',
    TECH_LEAD = 'tech_lead',
    DESIGNER = 'designer',
    MARKETING = 'marketing',
    PRODUCT_MANAGER = 'product_manager'
  }
  
  enum ChatStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
  }
  ```

### Шаг 6.7: Типы для конфигурации
- [ ] Создать `src/types/config.ts`:
  ```typescript
  interface AppConfig {
    ai: AIConfig;
    rag: RAGConfig;
    ui: UIConfig;
  }
  
  interface AIConfig {
    defaultProvider: AIProvider;
    models: ModelConfig[];
    maxTokens: number;
    temperature: number;
  }
  
  interface ModelConfig {
    id: string;
    provider: AIProvider;
    name: string;
    maxTokens: number;
    costPer1kTokens: number;
  }
  ```

### Шаг 6.8: Типы для состояния приложения
- [ ] Создать `src/types/state.ts`:
  ```typescript
  interface AppState {
    chats: Chat[];
    activeChat?: Chat;
    availableExperts: Expert[];
    selectedExperts: Expert[];
    isLoading: boolean;
    error?: string;
  }
  
  interface ChatState {
    messages: Message[];
    isTyping: Record<string, boolean>; // expertId -> isTyping
    ragResults?: RAGResult;
  }
  ```

### Шаг 6.9: Типы для UI компонентов
- [ ] Создать `src/types/ui.ts`:
  ```typescript
  interface ExpertCardProps {
    expert: Expert;
    isSelected: boolean;
    onToggle: (expertId: string) => void;
  }
  
  interface ChatMessageProps {
    message: Message;
    expert?: Expert;
    showAvatar?: boolean;
  }
  
  interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    selectedExperts: Expert[];
  }
  ```

### Шаг 6.10: Создание индексного файла типов
- [ ] Создать `src/types/index.ts` с экспортом всех типов:
  ```typescript
  export * from './ai';
  export * from './expert';
  export * from './chat';
  export * from './rag';
  export * from './api';
  export * from './config';
  export * from './state';
  export * from './ui';
  ```

### Шаг 6.11: Валидация типов с Zod
- [ ] Создать схемы валидации с использованием Zod
- [ ] Добавить runtime валидацию для API запросов
- [ ] Создать схемы для конфигурационных файлов
- [ ] Добавить валидацию переменных окружения

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полная типизация для всех сущностей приложения
- ✅ Типы для чатов с множественными экспертами
- ✅ Интерфейсы для RAG системы
- ✅ API типы для запросов и ответов
- ✅ Конфигурационные типы
- ✅ UI типы для компонентов
- ✅ Runtime валидация с Zod